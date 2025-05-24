document.addEventListener('DOMContentLoaded', async () => {
    const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWppeXd5cmJubGZsenlhY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODI1NDEsImV4cCI6MjA2MzI1ODU0MX0.MaMVpNzCWdiBufFzhd6RL4riLQQejTUG4FWd5cuHUd8';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    async function loadSolde() {
      try {
        const { data, error } = await supabase
          .from('solde')
          .select('montant')
          .order('id', { ascending: false })
          .limit(1);

        if (error) throw error;

        const solde = data?.[0]?.montant ?? 0;

        document.getElementById('solde').textContent =
          new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 3 }).format(solde) + ' DT';

      } catch (error) {
        console.error('Erreur chargement solde :', error);
        document.getElementById('solde').textContent = 'Erreur';
      }
    }

    await loadSolde();
    //impression historique des entretiens
    const printHistIcon = document.getElementById('printhist');
    printHistIcon.addEventListener('click', () => {
        const historySection = document.getElementById('history');
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Historique des entretiens</title>');
        printWindow.document.write('<style>');
        // Copy relevant styles for printing
        printWindow.document.write(`
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f57c2c; color: white; font-size: 14px; text-transform: uppercase; }
            tr:nth-child(even) td { background-color: #f4f7fb; }
            h2 { font-size: 22px; margin-bottom: 10px; }
            .hidden { display: none; } /* Hide the ID column if you don't want it printed */
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(historySection.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    });
  });
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
