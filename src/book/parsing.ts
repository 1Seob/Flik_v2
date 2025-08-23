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
  const raw = fs.readFileSync(file, 'utf8');
  const obj = JSON.parse(raw) as Record<string, string>;

  // 인덱스 순으로 정렬 후 문단 배열 생성, "\n" (또는 공백뿐) 항목 제거
  const paragraphs = Object.keys(obj)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => normalizeParagraph(obj[k]))
    .filter((p) => p.length > 0);

  const pages: string[] = [];
  let curText = '';
  let curLogicalLen = 0;

  const flushPage = () => {
    if (curText.trim().length > 0) {
      pages.push(curText.trim());
      curText = '';
      curLogicalLen = 0;
    }
  };

  for (const para of paragraphs) {
    if (para.length <= MAX_LOGICAL) {
      // 일반 문단: 현재 페이지에 들어갈 수 있는지 확인
      const cost = (curText ? NEWLINE_LOGICAL_COST : 0) + para.length;
      if (curLogicalLen + cost <= MAX_LOGICAL) {
        if (curText) {
          curText += NEWLINE_BETWEEN_PARAS;
          curLogicalLen += NEWLINE_LOGICAL_COST;
        }
        curText += para;
        curLogicalLen += para.length;
      } else {
        flushPage();
        curText += para;
        curLogicalLen += para.length;
      }
      continue;
    }

    // 긴 문단: 문장 단위로 분해
    const sentences = splitSentences(para);

    let i = 0;
    let isFirstChunkOnThisPageForThisPara = true;

    while (i < sentences.length) {
      let s = sentences[i];

      if (s.length <= MAX_LOGICAL) {
        // 같은 문단 내 문장 연결: 첫 문장만 문단 헤더 비용(20) 부과
        const headerCost =
          curText && isFirstChunkOnThisPageForThisPara
            ? NEWLINE_LOGICAL_COST
            : 0;
        const glueCost =
          !isFirstChunkOnThisPageForThisPara && !endsWithSpace(curText) ? 1 : 0;
        const wouldBe = curLogicalLen + headerCost + glueCost + s.length;

        if (wouldBe <= MAX_LOGICAL) {
          if (headerCost) {
            curText += NEWLINE_BETWEEN_PARAS;
            curLogicalLen += NEWLINE_LOGICAL_COST;
          }
          if (glueCost) {
            curText += ' ';
            curLogicalLen += 1;
          }
          curText += s;
          curLogicalLen += s.length;
          isFirstChunkOnThisPageForThisPara = false;
          i++;
        } else {
          flushPage();
          isFirstChunkOnThisPageForThisPara = true;
        }
        continue;
      }

      // 문장 자체가 300자 초과 → 공백 기준으로 분할하여 "개별 문단"처럼 취급
      const forcedParas = splitLongSentenceAsParagraphs(s, MAX_LOGICAL);

      for (const fp of forcedParas) {
        const cost = (curText ? NEWLINE_LOGICAL_COST : 0) + fp.length;
        if (curLogicalLen + cost <= MAX_LOGICAL) {
          if (curText) {
            curText += NEWLINE_BETWEEN_PARAS;
            curLogicalLen += NEWLINE_LOGICAL_COST;
          }
          curText += fp;
          curLogicalLen += fp.length;
        } else {
          flushPage();
          // 새 페이지 시작 (맨 앞은 개행 비용 없음)
          curText += fp;
          curLogicalLen += fp.length;
        }
      }

      // 강제 문단으로 다 배치했으니 이 초장문장은 처리 완료
      // 다음 원래 문장으로 이동. 다음 문장은 '새 문단 시작' 상태로 취급
      i++;
      isFirstChunkOnThisPageForThisPara = true;
    }
  }

  flushPage();
  return pages;
}

/** 문단 전처리: 내부 개행을 공백으로, 양끝 공백 정리 */
function normalizeParagraph(p: string): string {
  if (!p) return '';
  if (/^\s*\\?n\s*$/.test(p) || /^[\s\n\r]*$/.test(p)) return '';
  return p
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 문장 분리(한국어/기호 대응) */
function splitSentences(text: string): string[] {
  const enders = /[.!?…！？。]+(?=(?:["')\]\}»”’〉》」』]|$))/g;
  const parts: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  // 종결부호 단위로 끊기
  while ((m = enders.exec(text)) !== null) {
    const endIdx = m.index + m[0].length;
    const chunk = text.slice(last, endIdx).trim();
    if (chunk) parts.push(chunk);
    last = endIdx;
  }
  const tail = text.slice(last).trim();
  if (tail) parts.push(tail);

  // 종결부호가 전혀 없는 경우: 통째로 반환
  return parts.length ? parts : [text.trim()];
}

/**
 * 300 초과 문장을 "공백 기준"으로 잘라 각 조각을 <= MAX_LOGICAL 로 만든다.
 * (단어가 300자보다 길면 어쩔 수 없이 하드 컷)
 */
function splitLongSentenceAsParagraphs(
  sentence: string,
  limit: number,
): string[] {
  const words = sentence.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];

  let buf = '';
  let curLen = 0;

  const pushBuf = () => {
    const t = buf.trim();
    if (t) chunks.push(t);
    buf = '';
    curLen = 0;
  };

  for (const w of words) {
    // 단어가 limit를 초과하는 병적인 케이스: 하드 컷(희귀)
    if (w.length > limit) {
      if (curLen > 0) pushBuf();
      // 고정 길이로 강제 분할
      for (let i = 0; i < w.length; i += limit) {
        chunks.push(w.slice(i, i + limit));
      }
      continue;
    }

    const extra = (curLen === 0 ? 0 : 1) + w.length; // 앞 공백 + 단어
    if (curLen + extra <= limit) {
      if (curLen > 0) {
        buf += ' ';
        curLen += 1;
      }
      buf += w;
      curLen += w.length;
    } else {
      pushBuf();
      buf = w;
      curLen = w.length;
    }
  }
  pushBuf();
  return chunks;
}

function endsWithSpace(s: string) {
  if (!s) return false;
  return /\s/.test(s[s.length - 1]);
}
