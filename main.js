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
