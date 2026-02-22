import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function usePDFExport(totalSlides: number, goToSlide: (index: number) => void) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportPDF = useCallback(async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1920, 1080], // Standard 1080p slide format
      });

      // Loop through all slides
      for (let i = 0; i < totalSlides; i++) {
        await new Promise<void>((resolve, reject) => {
          // 1. Navigate to slide
          goToSlide(i);
          
          // 2. Wait for transition and render (2 seconds should be safe)
          setTimeout(async () => {
            try {
              // 3. Find the canvas and the text overlay
              const canvas = document.querySelector('canvas');
              const overlay = document.querySelector('.text-overlay-root') as HTMLElement;
              
              if (!canvas) throw new Error('Canvas not found');

              // 4. Create a temporary container to merge them
              const container = document.createElement('div');
              container.style.width = '1920px';
              container.style.height = '1080px';
              container.style.position = 'fixed';
              container.style.top = '0';
              container.style.left = '0';
              container.style.zIndex = '-1000';
              container.style.background = '#000'; // Ensure black background
              document.body.appendChild(container);

              // 5. Draw WebGL canvas to image
              const bgImage = document.createElement('img');
              bgImage.src = canvas.toDataURL('image/png'); // Use PNG for better quality
              bgImage.style.width = '100%';
              bgImage.style.height = '100%';
              bgImage.style.objectFit = 'cover';
              container.appendChild(bgImage);

              // 6. Clone overlay if it exists
              if (overlay) {
                const overlayClone = overlay.cloneNode(true) as HTMLElement;
                // Force clone to full size and remove scroll/overflow
                overlayClone.style.position = 'absolute';
                overlayClone.style.inset = '0';
                overlayClone.style.width = '1920px';
                overlayClone.style.height = '1080px';
                overlayClone.style.overflow = 'hidden';
                overlayClone.style.transform = 'scale(1)';
                
                // Important: Ensure all text is visible (opacity 1)
                const textElements = overlayClone.querySelectorAll('*');
                textElements.forEach((el) => {
                  if (el instanceof HTMLElement) {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                    el.style.transition = 'none';
                    el.style.animation = 'none';
                  }
                });
                
                container.appendChild(overlayClone);
              }

              // 7. Render the merged view to canvas
              const mergedCanvas = await html2canvas(container, {
                width: 1920,
                height: 1080,
                scale: 1,
                useCORS: true,
                backgroundColor: '#000000',
                logging: false,
                allowTaint: true,
              });

              // 8. Add to PDF
              if (i > 0) pdf.addPage([1920, 1080], 'landscape');
              pdf.addImage(mergedCanvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 1920, 1080);

              // Cleanup
              document.body.removeChild(container);
              setExportProgress(Math.round(((i + 1) / totalSlides) * 100));
              resolve();
            } catch (e) {
              reject(e);
            }
          }, 3000); // Increased wait time to 3s to ensure full render
        });
      }

      // Save PDF
      pdf.save('Menius_Pitch_Deck.pdf');

    } catch (error) {
      console.error('PDF Export failed:', error);
      alert('Failed to export PDF. Check console for details.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [totalSlides, goToSlide]);

  return { exportPDF, isExporting, exportProgress };
}
