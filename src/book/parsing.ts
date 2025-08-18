import * as fs from 'fs';
import * as path from 'path';

/** 페이지 구성 규칙 상수 */
const MAX_LOGICAL = 300;
const NEWLINE_BETWEEN_PARAS = '\n\n';
const NEWLINE_LOGICAL_COST = 20;

/**
 * 주어진 json 베이스 이름(확장자 제외, 같은 폴더)에 대해
 * 페이지(문자열) 리스트를 만들어 반환한다.
 *
 * 예) "book" -> 같은 폴더의 "book.json"을 읽어 파싱
 */
export function parsePagesFromJson(basename: string): string[] {
  const file = path.resolve(`${basename}.json`);
  const raw = fs.readFileSync(file, 'utf8');
  const obj = JSON.parse(raw) as Record<string, string>;

  // 인덱스 순서대로 정렬해 문단 배열 생성, "\n" 또는 공백뿐인 항목은 제거
  const paragraphs = Object.keys(obj)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => normalizeParagraph(obj[k]))
    .filter((p) => p.length > 0);

  const pages: string[] = [];
  let curText = ''; // 실제 문자열 (렌더링용)
  let curLogicalLen = 0; // 논리 길이 (개행은 20으로 계산)

  const flushPage = () => {
    if (curText.trim().length > 0) {
      pages.push(curText.trim());
      curText = '';
      curLogicalLen = 0;
    }
  };

  for (const para of paragraphs) {
    if (para.length <= MAX_LOGICAL) {
      // 일반 문단: 현재 페이지에 들어갈 수 있는지 체크(사이에 빈 줄 비용 20)
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
        // 새 페이지 시작(맨 앞은 개행 비용 없음)
        curText += para;
        curLogicalLen += para.length;
      }
    } else {
      // 긴 문단: 문장 단위로 쪼개어 페이지에 나눠 담기
      const sentences = splitSentences(para);
      let i = 0;
      let isFirstChunkOnThisPageForThisPara = true;

      while (i < sentences.length) {
        const next = sentences[i];

        // 새 문단이 페이지에 처음 들어갈 때만 빈 줄 비용 부과
        const headerCost =
          curText && isFirstChunkOnThisPageForThisPara
            ? NEWLINE_LOGICAL_COST
            : 0;
        const fits = curLogicalLen + headerCost + next.length <= MAX_LOGICAL;

        if (fits) {
          if (headerCost) {
            curText += NEWLINE_BETWEEN_PARAS;
            curLogicalLen += NEWLINE_LOGICAL_COST;
          }
          // 같은 문단 내에서 문장 연결은 공백 1개로
          if (!isFirstChunkOnThisPageForThisPara && !endsWithSpace(curText)) {
            curText += ' ';
            curLogicalLen += 1;
          }
          curText += next;
          curLogicalLen += next.length;
          isFirstChunkOnThisPageForThisPara = false;
          i++;
        } else {
          // 현재 페이지가 비어 있지 않으면 페이지를 끝내고 다음 페이지에서 이어 붙이기
          if (curText) {
            flushPage();
            // 새 페이지가 시작되면 이 문단의 '처음 조각' 상태로 리셋
            isFirstChunkOnThisPageForThisPara = true;
            continue;
          }
          // (현재 페이지가 비어있는데도) 문장 하나가 300 초과 → 규칙상 분할 불가
          // 해당 문장을 단독 페이지로 (초과 허용)
          curText = next;
          curLogicalLen = next.length; // 논리 길이는 기록만, 초과 여부는 허용
          flushPage();
          i++;
          // 다음 문장은 이 문단의 새 조각으로 간주
          isFirstChunkOnThisPageForThisPara = true;
        }
      }
    }
  }

  flushPage();
  return pages;
}

/** 문단 전처리: 내부 개행을 공백으로, 양끝 공백 정리 */
function normalizeParagraph(p: string): string {
  if (!p) return '';
  // 값이 '\n' 또는 공백/개행 뿐이면 제거
  if (/^\s*\\?n\s*$/.test(p) || /^[\s\n\r]*$/.test(p)) return '';
  // 실제 줄바꿈이 섞였으면 문단 내부 줄바꿈은 공백으로 치환
  const cleaned = p
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned;
}

/**
 * 한국어/기호 혼용 텍스트를 문장 단위로 분할.
 * 마침표/물음표/느낌표/…(엘립시스) 등을 종결 기준으로,
 * 종결 직후의 닫는 따옴표/괄호류도 함께 붙인다.
 */
function splitSentences(text: string): string[] {
  const enders = new Set(['.', '!', '?', '。', '！', '？', '…']);
  const closers = new Set([
    '"',
    "'",
    '」',
    '』',
    '》',
    '〉',
    '」',
    '』',
    ')',
    '］',
    ']',
    '」',
  ]);
  const out: string[] = [];
  let buf = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    buf += ch;

    if (enders.has(ch)) {
      // 연속 엘립시스 "……" 같은 경우: 다음도 ender면 계속 소비
      while (i + 1 < text.length && enders.has(text[i + 1])) {
        i++;
        buf += text[i];
      }
      // 종결 후 붙는 닫힘 기호들 붙이기
      while (i + 1 < text.length && closers.has(text[i + 1])) {
        i++;
        buf += text[i];
      }
      // 뒤따르는 공백은 문장 밖으로(나중에 다시 넣음)
      out.push(buf.trim());
      buf = '';
    }
  }
  if (buf.trim().length > 0) out.push(buf.trim());
  return out;
}

function endsWithSpace(s: string) {
  if (!s) return false;
  const last = s[s.length - 1];
  return /\s/.test(last);
}
