import * as fs from 'fs';

/**
 *
 * 1) 빈 줄을 기준으로 문단 분리
 * 2) 너무 긴 문단(MAX_LEN 초과)은 문장 단위로 쪼개서 분할
 * 3) 너무 짧은 문단(MIN_LEN 미만)은 다음 문단과 합쳐서 길이 조정
 * 4) 최종 결과를 순서대로 반환
 *
 * @param filePath  TXT 파일 이름
 * @returns         파싱된 문단 배열(순서 유지)
 */

export function parsing(fileName: string): string[] {
  function removeNumericLines(text: string): string {
    return text
      .split('\n') // 줄 단위로 분할
      .filter((line) => !/^\d+$/.test(line.trim())) // 숫자로만 구성된 라인이 아니면 통과
      .join('\n'); // 다시 합침
  }

  // 1) 파일 읽기
  let rawText = fs.readFileSync(fileName, 'utf-8');
  rawText = removeNumericLines(rawText); // 숫자로만 구성된 줄 제거

  const minLen = 130; //문단 최소 길이(문자 수)
  const maxLen = 350; //문단 최대 길이(문자 수)

  // 2) 빈 줄을 기준으로 문단 분리
  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  const paragraphs: string[] = [];
  let bufferArr: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      // 빈 줄 => 문단 구분
      if (bufferArr.length > 0) {
        paragraphs.push(bufferArr.join(' '));
        bufferArr = [];
      }
    } else {
      bufferArr.push(trimmed);
    }
  }
  // 마지막 문단
  if (bufferArr.length > 0) {
    paragraphs.push(bufferArr.join(' '));
  }

  // 3) 문장이 너무 긴 문단을 "문장 단위"로 쪼개는 함수 (내부 함수)
  function splitParagraphByMaxLength(
    paragraph: string,
    maxLen: number,
  ): string[] {
    // (3-A) 정규식으로 문장 추출: 구두점(.?! ) 뒤에 공백 또는 문장 끝을 문장 경계로
    const sentenceRegex = /[^.?!]+[.?!]+(\s+|$)/g;
    const sentences: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = sentenceRegex.exec(paragraph)) !== null) {
      const s = match[0].trim();
      if (s) sentences.push(s);
    }

    // 마지막 문장이 구두점으로 안 끝날 수 있으므로 남은 부분 처리
    const lastIdx = sentenceRegex.lastIndex;
    if (lastIdx < paragraph.length) {
      const tail = paragraph.slice(lastIdx).trim();
      if (tail) sentences.push(tail);
    }

    // (3-B) 문장들(sentences)을 합치면서 길이 제한(maxLen) 이하로 chunk 생성
    const result: string[] = [];
    let buffer = '';

    for (const sentence of sentences) {
      const next = buffer ? buffer + ' ' + sentence : sentence;
      if (next.length <= maxLen) {
        // 합쳐도 OK
        buffer = next;
      } else {
        // 합치면 초과 -> buffer를 결과에 확정
        if (buffer) {
          result.push(buffer);
        }
        // sentence 자체가 maxLen을 초과하면(드문 케이스), 통째로 넣고 비움
        if (sentence.length > maxLen) {
          result.push(sentence);
          buffer = '';
        } else {
          buffer = sentence;
        }
      }
    }

    // 남은 buffer
    if (buffer) {
      result.push(buffer);
    }

    return result;
  }

  // 3) 각 문단이 너무 긴 경우, 문장 단위로 나눠서 여러 개로 만든다
  let splittedParagraphs: string[] = [];
  for (const paragraph of paragraphs) {
    if (paragraph.length > maxLen) {
      // 길이 초과 -> 문장 단위로 쪼갬
      const chunks = splitParagraphByMaxLength(paragraph, maxLen);
      splittedParagraphs.push(...chunks);
    } else {
      splittedParagraphs.push(paragraph);
    }
  }

  // 4) 너무 짧은 문단(MIN_LEN 미만)은 다음 문단과 합쳐본다
  //    순서 유지, 중간에 끊지 않는다
  const finalParagraphs: string[] = [];
  let buffer = '';

  for (let i = 0; i < splittedParagraphs.length; i++) {
    const current = splittedParagraphs[i];
    if (!buffer) {
      // 버퍼가 비어 있으면 현재 문단을 버퍼로
      buffer = current;
      continue;
    }

    const combined = buffer + ' ' + current;
    // - 버퍼가 이미 MIN_LEN 이상이면 굳이 합칠 필요가 없을 수도 있지만
    //   여기서는 "버퍼가 MIN_LEN 미만이면 합치는 걸 시도"라는 식으로 구현
    if (buffer.length < minLen && combined.length <= maxLen) {
      // 짧은 문단 + 다음 문단 합쳐도 maxLen 이하면 합친다
      buffer = combined;
    } else {
      // buffer를 확정
      finalParagraphs.push(buffer);
      buffer = current;
    }
  }
  // 마지막 버퍼 처리
  if (buffer) {
    finalParagraphs.push(buffer);
  }

  return finalParagraphs;
}

/**
 * 문단을 30일치로 나누는 함수
 */
export function distributeParagraphs(paragraphs: number[]): number[][] {
  const totalParagraphs = paragraphs.length;
  const days = 30;

  if (totalParagraphs === 0) return Array.from({ length: days }, () => []);

  const baseCount = Math.floor(totalParagraphs / days); // 기본 할당할 문단 개수
  const remainder = totalParagraphs % days; // 남은 문단 개수

  const distributed: number[][] = [];
  let index = 0;

  for (let i = 0; i < days; i++) {
    // 앞쪽부터 remainder 개수만큼 하루에 하나씩 추가 배정
    const extra = i < remainder ? 1 : 0;
    distributed.push(
      Array.from({ length: baseCount + extra }, (_, k) => index + k),
    );
    index += baseCount + extra;
  }

  return distributed;
}
