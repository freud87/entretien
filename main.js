    document.addEventListener('DOMContentLoaded', () => {
      const btnPlan = document.getElementById('btnplan');
      const btnHist = document.getElementById('btnhist');
      const planSection = document.getElementById('plan');
      const historySection = document.getElementById('history');

      btnPlan.addEventListener('click', () => {
        planSection.style.display = 'block';
        historySection.style.display = 'none';
        btnPlan.style.display = 'none';
        btnHist.style.display = 'inline-block';
      });

      btnHist.addEventListener('click', () => {
        historySection.style.display = 'block';
        planSection.style.display = 'none';
        btnHist.style.display = 'none';
        btnPlan.style.display = 'inline-block';
      });
    });
//Impression historique entretien
  document.getElementById('printhist').addEventListener('click', () => {
    const historySection = document.getElementById('history');

    // Création d'une fenêtre temporaire pour l'impression
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Historique des entretiens</title>');
    
    // Copie du style actuel pour que l'impression soit jolie
    const styles = Array.from(document.querySelectorAll('style')).map(s => s.innerHTML).join('');
    printWindow.document.write(`<style>${styles}</style></head><body>`);

    // On copie le contenu de la section #history
    printWindow.document.write(historySection.innerHTML);
    
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Lancement de l'impression
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  });
