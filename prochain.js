document.addEventListener("DOMContentLoaded", () => {
  // Convertit "352 000" → 352000
  const parseKilometrage = str =>
    parseInt(str.replace(/\s/g, '').replace(/[^0-9]/g, ''), 10);

  // Lecture de la moyenne (en km/mois → km/jour)
  const getMoyenne = () => {
  const txt = document.querySelector("#moyenne")?.textContent || "1";
  const chiffre = txt.replace(/\s/g, '').match(/\d+(\.\d+)?/); // ex: "1489"
  return chiffre ? parseFloat(chiffre[0]) / 30 : 1;  // Converti km/mois → km/jour
};


  // Récupère le plus grand kilométrage de #table-kilometrages
  const getDernierKilometrage = () => {
    let max = 0;
    document.querySelectorAll("#table-kilometrages tbody tr").forEach(row => {
      const cellKms = row.cells[2];
      if (!cellKms) return;
      const raw = cellKms.textContent;
      const kms = parseKilometrage(raw);
      if (kms > max) max = kms;
    });
    return max;
  };

  // Trouve la prochaine intervention pertinente
  const getProchaineIntervention = dernierKms => {
    let minDiff = Infinity;
    let best = null;

    document.querySelectorAll("#table-historique tbody tr").forEach(row => {
      if (row.cells.length < 6) return;

      const dateStr       = row.cells[1].textContent.trim();
      const kmsStr        = row.cells[2].textContent.trim();
      const intervention  = row.cells[3].textContent.trim();
      const prochainStr   = row.cells[5].textContent.trim();

      if (!prochainStr || prochainStr.toLowerCase().includes("aucune")) return;

      const prochainKms = parseKilometrage(prochainStr);
      const diff        = prochainKms - dernierKms;

      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        best = {
          intervention,
          prochainKms,
          dateIntervention: new Date(dateStr),
          kmsIntervention: parseKilometrage(kmsStr)
        };
      }
    });

    return best;
  };

  // Met à jour la table #table-prochain
  const updateTableProchain = (info, dernierKms, moyenne) => {
    const tbody = document.querySelector("#table-prochain tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!info) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td colspan="3" style="color:red">⚠ Aucune intervention future trouvée</td>
      `;
      tbody.appendChild(row);
      return;
    }

    const diffKms     = info.prochainKms - dernierKms;
    const joursRest   = diffKms / moyenne;
    const dateEstimee = new Date(Date.now() + joursRest * 86400000);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${info.intervention}</td>
      <td>${info.prochainKms.toLocaleString()} km</td>
      <td>${dateEstimee.toLocaleDateString()}</td>
    `;
    tbody.appendChild(tr);
  };

  // === EXÉCUTION ===
  const moyenne     = getMoyenne();
  const dernierKms  = getDernierKilometrage();
  const prochaine   = getProchaineIntervention(dernierKms);

  console.log({ moyenne, dernierKms, prochaine });
  updateTableProchain(prochaine, dernierKms, moyenne);
});
