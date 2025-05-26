document.addEventListener("DOMContentLoaded", () => {


function parseKilometrage(str) {
  return parseInt(str.replace(/\s/g, '').replace(/[^0-9]/g, ''), 10);
}

function getMoyenne() {
  const moyenneText = document.querySelector("#moyenne")?.textContent || "0";
  return parseFloat(moyenneText.replace(',', '.')) || 1; // éviter division par zéro
}

function getDernierKilometrage() {
  let maxKms = 0;
  document.querySelectorAll("#table-kilometrages tbody tr").forEach(row => {
    const kms = parseKilometrage(row.cells[2].textContent || "0");
    if (kms > maxKms) {
      maxKms = kms;
    }
  });
  return maxKms;
}

function getProchaineIntervention(dernierKms) {
  let minDiff = Infinity;
  let result = null;

  document.querySelectorAll("#table-historique tbody tr").forEach(row => {
    const intervention = row.cells[3].textContent.trim();
    const prochain = row.cells[5].textContent.trim();
    const dateStr = row.cells[1].textContent.trim();
    const date = new Date(dateStr);
    const kmsIntervention = parseKilometrage(row.cells[2].textContent);
    const prochainKms = parseKilometrage(prochain);
    const diff = prochainKms - dernierKms;

    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      result = {
        intervention,
        kmsIntervention,
        prochainKms,
        date
      };
    }
  });

  return result;
}

function updateTableProchain(info, dernierKms, moyenne) {
  const tbody = document.querySelector("#table-prochain tbody");
  tbody.innerHTML = "";

  if (!info) {
    tbody.innerHTML = "<tr><td colspan='3'>Aucune intervention prévue.</td></tr>";
    return;
  }

  const diffKms = info.prochainKms - dernierKms;
  const joursEstimes = diffKms / moyenne;
  const dateEstimee = new Date(Date.now() + joursEstimes * 86400000); // jours * ms

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${info.intervention}</td>
    <td>${info.prochainKms.toLocaleString()} km</td>
    <td>${dateEstimee.toLocaleDateString()}</td>
  `;
  tbody.appendChild(row);
}

// Lancer l’analyse
const moyenne = getMoyenne();
const dernierKms = getDernierKilometrage();
const prochaineIntervention = getProchaineIntervention(dernierKms);
updateTableProchain(prochaineIntervention, dernierKms, moyenne);
});
