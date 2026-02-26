import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOTAL_SLIDES = 12;
const TARGET_URL = 'http://localhost:5174/pitch/';
const OUTPUT_PATH = path.join(__dirname, 'public', 'Menius_Pitch_Deck.pdf');

// Helper for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generatePDF() {
  console.log('🚀 Starting PDF Generation (Selectable Text Version)...');
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2, // High DPI
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Array to store PDF buffers
  const pdfBuffers = [];

  try {
    console.log(`🌐 Navigating to ${TARGET_URL}...`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Ensure we capture screen styles, not print styles
    await page.emulateMediaType('screen');

    // Wait for initial load and intro animation
    console.log('⏳ Waiting for intro animation to complete...');
    await delay(10000);

    for (let i = 0; i < TOTAL_SLIDES; i++) {
      console.log(`� Capturing Slide ${i + 1}/${TOTAL_SLIDES} as PDF...`);

      // Use the exposed window function to navigate
      await page.evaluate((index) => {
        if (window.goToSlide) {
          window.goToSlide(index);
        } else {
          throw new Error('window.goToSlide is not defined!');
        }
      }, i);

      // Wait for transitions (3 seconds to be safe)
      await delay(3000);

      // Inject style to ensure opacity is 1 for all text elements
      await page.addStyleTag({
        content: `
          .text-overlay-root * {
            opacity: 1 !important;
            transition: none !important;
            animation: none !important;
          }
          /* Hide UI controls */
          .nav-dots, .nav-counter, button, a[download] {
            display: none !important;
          }
          /* Ensure background colors are printed if they are set on body/html */
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        `
      });

      // Capture PDF of the current slide
      // Note: We use width/height to match the viewport
      const pdfBuffer = await page.pdf({
        width: '1920px',
        height: '1080px',
        printBackground: true,
        pageRanges: '1'
      });

      pdfBuffers.push(pdfBuffer);
    }

    console.log('✨ All slides captured. Merging into final PDF...');

    // Create a new PDF document to merge into
    const mergedPdf = await PDFDocument.create();

    for (const buffer of pdfBuffers) {
      const srcDoc = await PDFDocument.load(buffer);
      const [copiedPage] = await mergedPdf.copyPages(srcDoc, [0]);
      mergedPdf.addPage(copiedPage);
    }

    // Serialize the PDFDocument to bytes
    const pdfBytes = await mergedPdf.save();

    // Write the PDF to file
    fs.writeFileSync(OUTPUT_PATH, pdfBytes);
    console.log(`✅ PDF successfully saved to: ${OUTPUT_PATH}`);

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
  } finally {
    await browser.close();
  }
}

generatePDF();
