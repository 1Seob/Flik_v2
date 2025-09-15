import * as fs from 'fs';
import * as path from 'path';

/** 페이지 구성 규칙 상수 */
const MAX_LOGICAL = 300;
const NEWLINE_BETWEEN_PARAS = '\n\n';
const NEWLINE_LOGICAL_COST = 20;

/**
 * 같은 폴더의 <basename>.json(키=인덱스, 값=문단 또는 "\n")을 읽어
 * 페이지(문자열) 배열을 반환한다.
 */
export function parsePagesFromJson(basename: string): string[] {
  const file = path.resolve(`${basename}.json`);
  const raw = fs.readFileSync(file, "utf8");
  const obj = JSON.parse(raw) as Record<string, string>;

  // 1) 인덱스 순 정렬 → 문단 정규화 → 빈 항목 제거
  const rawParas = Object.keys(obj)
    .sort((a, b) => Number(a) - Number(b))
    .map(k => normalizeParagraph(obj[k]))
    .filter(p => p.length > 0);

  // 2) "초장문장(>300)"은 공백 단위로 잘라 각각을 별도 문단으로 '승격'
  const paras = explodeLongSentencesIntoParagraphs(rawParas);

  // 3) 페이지 빌드
  const pages: string[] = [];
  let buf = "";           // 실제 렌더링 문자열
  let logical = 0;        // 논리 길이 (개행 20)

  const flush = () => {
    if (buf.trim().length > 0) pages.push(buf.trim());
    buf = "";
    logical = 0;
  };

  let i = 0; // 문단 인덱스
  while (i < paras.length) {
    const p = paras[i];
    const pPieces = splitSentences(p);         // 문장 단위
    const pFull = pPieces.join(" ");           // 문단 전체 문자열
    const pFullCost = (buf ? NEWLINE_LOGICAL_COST : 0) + pFull.length;

    // 3-1) 문단 전체가 현재 페이지에 들어가면 통째로 배치
    if (logical + pFullCost <= MAX_LOGICAL) {
      if (buf) { buf += NEWLINE_BETWEEN_PARAS; logical += NEWLINE_LOGICAL_COST; }
      buf += pFull;
      logical += pFull.length;
      i++;
      continue;
    }

    // 3-2) 문단 전체는 안 들어감 → "개행(필요시) + 문장 하나"씩 시도
    let j = 0; // 문장 인덱스
    while (j < pPieces.length) {
      const firstPieceOnThisPageForThisPara = (buf.length > 0) && (j === 0);
      const headerCost = firstPieceOnThisPageForThisPara ? NEWLINE_LOGICAL_COST : 0;

      const glueCost = (j > 0 && !endsWithSpace(buf)) ? 1 : 0; // 같은 문단 내 이어 붙일 때 공백 1자
      const piece = pPieces[j];
      const pieceCost = headerCost + glueCost + piece.length;

      if (logical + pieceCost <= MAX_LOGICAL) {
        if (headerCost) { buf += NEWLINE_BETWEEN_PARAS; logical += NEWLINE_LOGICAL_COST; }
        if (glueCost) { buf += " "; logical += 1; }
        buf += piece;
        logical += piece.length;
        j++;
      } else {
        // 더 못 넣으면 페이지 마감
        if (buf) { flush(); }
        else {
          // 페이지가 비어있는데도 한 문장이 안 들어가는 비정상 케이스는
          // (사전 분해에 의해 거의 불가) 안전장치로 하드 컷
          const forced = hardCutByLimit(piece, MAX_LOGICAL);
          buf += forced[0];
          logical += forced[0].length;
          flush();
          // 남은 조각은 현재 문단의 다음 문장처럼 이어서 처리
          const tail = forced.slice(1).join(" ");
          if (tail) {
            pPieces.splice(j, 1, tail);
          } else {
            j++; // 모두 소비됨
          }
        }
      }
    }
    // 이 문단을 모두 소비했으면 다음 문단으로
    if (j >= pPieces.length) i++;
  }

  flush();
  return pages;
}

/* ---------- 유틸들 ---------- */

/** 문단 전처리: "\n" 문단 제거, 내부 줄바꿈→공백, 다중 공백 정리 */
function normalizeParagraph(p: string): string {
  if (!p) return "";
  if (/^\s*\\?n\s*$/.test(p) || /^[\s\r\n]*$/.test(p)) return "";
  return p.replace(/\r?\n+/g, " ").replace(/\s+/g, " ").trim();
}

/** 문장 분리: 종결부호(., !, ?, …, 한중일 종결부호) + 뒤따르는 닫힘기호까지 포함 */
function splitSentences(text: string): string[] {
  const re = /[^.!?…！？。]+[.!?…！？。]+(?=(?:\s*["')\]\}»”’〉》」』])*\s*)|[^.!?…！？。]+$/g;
  const parts = text.match(re)?.map(s => s.trim()).filter(Boolean) ?? [];
  return parts.length ? parts : [text.trim()];
}

/** 300 초과 문장 → 공백 단위로 쪼개어 각각을 '문단'으로 승격 */
function explodeLongSentencesIntoParagraphs(paragraphs: string[]): string[] {
  const out: string[] = [];
  for (const para of paragraphs) {
    const sents = splitSentences(para);
    let acc = ""; // 300 이하 문장들을 모아 하나의 문단으로
    for (const s of sents) {
      if (s.length <= MAX_LOGICAL) {
        acc = acc ? `${acc} ${s}` : s;
        continue;
      }
      // 긴 문장 등장 → 앞서 모은 acc를 문단으로 배출
      if (acc) { out.push(acc); acc = ""; }
      // 긴 문장을 공백 기준으로 limit 이하로 분해하여 각 조각을 독립 문단으로
      const chunks = splitByWordsWithLimit(s, MAX_LOGICAL);
      out.push(...chunks);
    }
    if (acc) out.push(acc);
  }
  return out;
}

/** 공백 기준 분할(필요 시 단어가 너무 길면 하드 컷) */
function splitByWordsWithLimit(text: string, limit: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const res: string[] = [];
  let buf = "";
  let len = 0;

  const push = () => { if (buf) res.push(buf); buf = ""; len = 0; };

  for (const w of words) {
    if (w.length > limit) {
      push();
      for (let i = 0; i < w.length; i += limit) res.push(w.slice(i, i + limit));
      continue;
    }
    const extra = (len === 0 ? 0 : 1) + w.length;
    if (len + extra <= limit) {
      if (len > 0) { buf += " "; len += 1; }
      buf += w; len += w.length;
    } else {
      push();
      buf = w; len = w.length;
    }
  }
  push();
  return res;
}

/** 안전장치: 어떤 문자열이 limit를 초과하면 하드 컷 조각 배열 반환 */
function hardCutByLimit(text: string, limit: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += limit) out.push(text.slice(i, i + limit));
  return out;
}

function endsWithSpace(s: string) {
  if (!s) return false;
  return /\s/.test(s[s.length - 1]);
}
