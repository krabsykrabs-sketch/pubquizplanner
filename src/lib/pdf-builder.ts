import jsPDF from 'jspdf';
import type { AssembledQuiz } from '@/types/quiz';

export function buildAnswerSheet(quiz: AssembledQuiz): Buffer {
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
  doc.text('Teamname:', margin, y);
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
      `Runde ${roundIndex + 1}: ${round.config.categoryName}`,
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
    const pointsText = 'Punkte:';
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
  doc.text('Gesamtpunktzahl:', margin, y);
  doc.rect(margin + contentWidth - 35, y - 7, 35, 12);

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'Erstellt mit pubquizplanner.com',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
