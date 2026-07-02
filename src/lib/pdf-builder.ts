import jsPDF from 'jspdf';
import { getOutputStrings } from './output-strings';
import type { AssembledQuiz } from '@/types/quiz';

export function buildAnswerSheet(quiz: AssembledQuiz): Buffer {
  const s = getOutputStrings(quiz.config.locale);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(quiz.config.title, pageWidth / 2, y, { align: 'center' });
  y += 10;

  if (quiz.config.date || quiz.config.venue) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const info = [quiz.config.date, quiz.config.venue].filter(Boolean).join(' · ');
    doc.text(info, pageWidth / 2, y, { align: 'center' });
    y += 10;
  }

  // Team name field
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(s.teamName, margin, y);
  doc.setLineWidth(0.5);
  doc.line(margin + 30, y, margin + contentWidth, y);
  y += 15;

  // Rounds
  quiz.rounds.forEach((round, roundIndex) => {
    // Check if we need a new page
    const estimatedHeight = 15 + round.questions.length * 10 + 15;
    if (y + estimatedHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    // Round header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(
      `${s.round} ${roundIndex + 1}: ${round.config.categoryName}`,
      margin,
      y
    );
    y += 3;
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;

    // Answer lines
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    for (let i = 1; i <= round.questions.length; i++) {
      if (y > doc.internal.pageSize.getHeight() - margin - 10) {
        doc.addPage();
        y = margin;
      }
      doc.text(`${i}.`, margin, y);
      doc.setLineWidth(0.2);
      doc.line(margin + 8, y, margin + contentWidth - 30, y);
      y += 9;
    }

    // Points box
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const pointsText = s.points;
    const pointsX = margin + contentWidth - 45;
    doc.text(pointsText, pointsX, y);
    doc.rect(pointsX + 22, y - 5, 23, 8);
    y += 12;
  });

  // Total score
  if (y + 25 > doc.internal.pageSize.getHeight() - margin) {
    doc.addPage();
    y = margin;
  }
  y += 5;
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(s.totalScore, margin, y);
  doc.rect(margin + contentWidth - 35, y - 7, 35, 12);

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    s.madeWith,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

export function buildCheatSheet(
  quiz: AssembledQuiz,
  categoryNames: Record<number, string>
): Buffer {
  const s = getOutputStrings(quiz.config.locale);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(quiz.config.title, margin, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const info = [s.cheatSheetSubtitle, quiz.config.date, quiz.config.venue]
    .filter(Boolean)
    .join(' · ');
  doc.text(info, margin, y);
  doc.setTextColor(0, 0, 0);
  y += 8;

  quiz.rounds.forEach((round, roundIndex) => {
    // Round header
    ensureSpace(20);
    y += 4;
    doc.setFillColor(235, 235, 235);
    doc.rect(margin, y - 5, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(
      `${s.round} ${roundIndex + 1}: ${round.config.categoryName} (${round.questions.length} ${s.questions})`,
      margin + 2,
      y
    );
    y += 8;

    round.questions.forEach((q, qIndex) => {
      const categoryName = categoryNames[q.category_id] || round.config.categoryName;
      const meta = categoryName;

      doc.setFontSize(10.5);
      const questionLines = doc.splitTextToSize(
        `${qIndex + 1}. ${q.text_de}`,
        contentWidth
      );
      const answerLines = doc.splitTextToSize(
        `${s.answer}: ${q.answer_de}`,
        contentWidth - 55
      );
      doc.setFontSize(8.5);
      const funFactLines = q.fun_fact_de
        ? doc.splitTextToSize(`${s.funFact}: ${q.fun_fact_de}`, contentWidth - 5)
        : [];

      const blockHeight =
        questionLines.length * 4.5 +
        answerLines.length * 4.5 +
        funFactLines.length * 3.8 +
        5;
      ensureSpace(blockHeight);

      // Question
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.text(questionLines, margin, y);
      y += questionLines.length * 4.5;

      // Answer (bold) with per-question meta right-aligned
      doc.setFont('helvetica', 'bold');
      doc.text(answerLines, margin + 3, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(meta, margin + contentWidth, y, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      y += answerLines.length * 4.5;

      // Fun fact
      if (funFactLines.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(90, 90, 90);
        doc.text(funFactLines, margin + 3, y);
        doc.setTextColor(0, 0, 0);
        y += funFactLines.length * 3.8;
      }

      y += 3;
    });
  });

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(s.madeWith, pageWidth / 2, pageHeight - 8, {
      align: 'center',
    });
    doc.text(`${s.page} ${i}/${pageCount}`, pageWidth - margin, pageHeight - 8, {
      align: 'right',
    });
    doc.setTextColor(0, 0, 0);
  }

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
