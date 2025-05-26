
  function getLastKilometrage() {
    const rows = document.querySelectorAll("#table-kilometrages tbody tr");
    let maxKm = 0;
    rows.forEach(row => {
      const km = parseFloat(row.cells[2].textContent);
      if (!isNaN(km) && km > maxKm) maxKm = km;
    });
    return maxKm;
  }

  function parseDateFrToJs(dateStr) {
    // Supporte le format JJ/MM/AAAA
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
  }

  function formatDateJsToFr(dateObj) {
    return dateObj.toLocaleDateString('fr-FR');
  }

  function getNextIntervention() {
    const moyenne = parseFloat(document.getElementById("moyenne").textContent);
    if (isNaN(moyenne) || moyenne <= 0) return;

    const lastKm = getLastKilometrage();
    const rows = document.querySelectorAll("#table-historique tbody tr");

    let closestRow = null;
    let minDiff = Infinity;

    rows.forEach(row => {
      const prochainKm = parseFloat(row.cells[5].textContent); // "Prochain"
      if (!isNaN(prochainKm) && prochainKm > lastKm) {
        const diff = prochainKm - lastKm;
        if (diff < minDiff) {
          minDiff = diff;
          closestRow = row;
        }
      }
    });

    if (!closestRow) return;

    const intervention = closestRow.cells[3].textContent;
    const prochainKm = parseFloat(closestRow.cells[5].textContent);
    const dateIntervention = parseDateFrToJs(closestRow.cells[1].textContent); // "Date"
    const joursRestants = Math.round((prochainKm - lastKm) / moyenne);
    const dateApprox = new Date(dateIntervention);
    dateApprox.setDate(dateApprox.getDate() + joursRestants);

    // Injection dans #table-prochain
    const tbody = document.querySelector("#table-prochain tbody");
    tbody.innerHTML = `
      <tr>
        <td>${intervention}</td>
        <td>${prochainKm}</td>
        <td>${formatDateJsToFr(dateApprox)}</td>
      </tr>
    `;
  }

  // Lancer la fonction après chargement du DOM
  document.addEventListener("DOMContentLoaded", getNextIntervention);



