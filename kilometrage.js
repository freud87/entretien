document.addEventListener('DOMContentLoaded', async () => {
  // Configuration Supabase
  const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWppeXd5cmJubGZsenlhY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODI1NDEsImV4cCI6MjA2MzI1ODU0MX0.MaMVpNzCWdiBufFzhd6RL4riLQQejTUG4FWd5cuHUd8';

  // Initialisation du client Supabase
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


  const tbody = document.getElementById('table-kilometrages');
  const btnSave = document.getElementById('btn-save-km');
  const btnAdd = document.querySelector('btn-add-km');
  let isEditing = false;

  async function loadKilometrages() {
    try {
      const { data, error } = await supabase
        .from('kilometrage')
        .select('id, date, kilometrage')
        .order('date', { ascending: false });

      if (error) throw error;

      tbody.innerHTML = '';
      data.forEach(record => {
        const row = document.createElement('tr');

        const idCell = document.createElement('td');
        idCell.className = 'hidden';
        idCell.textContent = record.id;

        const dateCell = document.createElement('td');
        const formattedDate = new Date(record.date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        dateCell.textContent = formattedDate;

        const kmCell = document.createElement('td');
        kmCell.textContent = new Intl.NumberFormat('fr-FR').format(record.kilometrage);

        row.append(idCell, dateCell, kmCell);
        tbody.appendChild(row);
      });
    } catch (error) {
      console.error('Erreur de chargement:', error);
    }
  }

  // 👉 Ajouter une ligne vide pour saisie
  btnAdd.addEventListener('click', () => {
    if (isEditing) return;

    const newRow = document.createElement('tr');
    newRow.style.backgroundColor = '#f9f1d3'; // couleur différente pour édition

    const idCell = document.createElement('td');
    idCell.className = 'hidden';
    idCell.textContent = '';

    const dateCell = document.createElement('td');
    const dateInput = document.createElement('input');
    dateInput.type = 'text';
    dateInput.placeholder = 'jj/mm/aaaa';
    dateInput.style.width = '100%';
    dateCell.appendChild(dateInput);

    const kmCell = document.createElement('td');
    const kmInput = document.createElement('input');
    kmInput.type = 'number';
    kmInput.placeholder = 'Kilométrage';
    kmInput.style.width = '100%';
    kmCell.appendChild(kmInput);

    newRow.append(idCell, dateCell, kmCell);
    tbody.appendChild(newRow);

    isEditing = true;
    btnSave.style.display = 'inline';
  });

  // 👉 Sauvegarder les données saisies
  btnSave.addEventListener('click', async () => {
    const lastRow = tbody.lastElementChild;
    const dateInput = lastRow.querySelector('td:nth-child(2) input');
    const kmInput = lastRow.querySelector('td:nth-child(3) input');

    const rawDate = dateInput.value;
    const [jj, mm, aaaa] = rawDate.split('/');
    const isoDate = `${aaaa}-${mm}-${jj}`; // conversion jj/mm/aaaa → aaaa-mm-jj
    const kilometrage = parseInt(kmInput.value, 10);

    if (!rawDate || isNaN(kilometrage)) {
      alert("Veuillez remplir correctement la date et le kilométrage.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('kilometrage')
        .insert([{ date: isoDate, kilometrage }]);

      if (error) throw error;

      // Recharge les données
      await loadKilometrages();
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
    } finally {
      btnSave.style.display = 'none';
      isEditing = false;
    }
  });

  // ✅ Chargement initial
  await loadKilometrages();
});
