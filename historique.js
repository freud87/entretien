document.addEventListener('DOMContentLoaded', async () => {
  const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWppeXd5cmJubGZsenlhY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODI1NDEsImV4cCI6MjA2MzI1ODU0MX0.MaMVpNzCWdiBufFzhd6RL4riLQQejTUG4FWd5cuHUd8';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);



    const moyenne = parseFloat(document.getElementById('moyenne').value);

    // Charger les données
    const { data: historique, error: error1 } = await supabase
      .from('historique')
      .select('*')
      .order('date', { ascending: false });

    const { data: plan, error: error2 } = await supabase
      .from('plan')
      .select('*');

    if (error1 || error2) {
      console.error('Erreur de chargement :', error1 || error2);
      return;
    }

    const tbody = document.getElementById('table-historique');
    tbody.innerHTML = '';

    historique.forEach(item => {
      const row = document.createElement('tr');

      const idCell = `<td class="hidden">${item.id}</td>`;
      const dateCell = `<td>${new Date(item.date).toLocaleDateString('fr-FR')}</td>`;
      const kmCell = `<td>${item.kilometrage}</td>`;
      const interventionCell = `<td>${item.intervention}</td>`;

      // Trouver le cycle de l'intervention
      const planItem = plan.find(p => p.intervention === item.intervention);
      let prochainKmCell = '<td>-</td>';
      let prochaineDateCell = '<td>-</td>';

      if (planItem && item.kilometrage) {
        const cycle_km = parseFloat(planItem.cycle_km);
        const prochainKm = item.kilometrage + cycle_km;
        const jours = Math.round(cycle_km / moyenne);

        const prochaineDate = new Date(item.date);
        prochaineDate.setDate(prochaineDate.getDate() + jours);

        prochainKmCell = `<td>${prochainKm.toLocaleString('fr-FR')}</td>`;
        prochaineDateCell = `<td>${prochaineDate.toLocaleDateString('fr-FR')}</td>`;
      }

      row.innerHTML = idCell + dateCell + kmCell + interventionCell + prochainKmCell + prochaineDateCell;
      tbody.appendChild(row);
    });
  });
