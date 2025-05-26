document.addEventListener("DOMContentLoaded", () => {
  /** Convertit "352 000" → 352000 */
  const parseKilometrage = str =>
    parseInt(str.replace(/\s/g, '').replace(/[^0-9]/g, ''), 10);

  /** Moyenne en km/jour lue dans <span id="moyenne"> */
  const getMoyenne = () => {
    const txt = document.querySelector("#moyenne")?.textContent || "1";
    return parseFloat(txt.replace(',', '.')) || 1;   // évite /0
  };

  /** Dernier kilométrage saisi dans #table-kilometrages */
  const getDernierKilometrage = () => {
    let max = 0;
    document.querySelectorAll("#table-kilometrages tbody tr").forEach(row => {
      const cellKms = row.cells[2];          // 0=ID, 1=Date, 2=Kms
      if (!cellKms) return;
      const kms = parseKilometrage(cellKms.textContent);
      if (kms > max) max = kms;
    });
    return max;
  };

  /** Trouve l’intervention dont “PROCHAIN” est > dernierKms et la plus proche */
  const getProchaineIntervention = dernierKms => {
    let minDiff = Infinity;
    let best = null;

    document.querySelectorAll("#table-historique tbody tr").forEach(row => {
      if (row.cells.length < 6) return;      // 6 colonnes attendues

      const dateStr       = row.cells[1].textContent.trim();
      const kmsStr        = row.cells[2].textContent.trim();
      const intervention  = row.cells[3].textContent.trim();
      const prochainStr   = row.cells[5].textContent.trim(); // PROCHAIN

      // Ignorer les “Aucune donnée”
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

  /** Remplit #table-prochain */
  const updateTableProchain = (info, dernierKms, moyenne) => {
    const tbody = document.querySelector("#table-prochain tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!info) {
      tbody.innerHTML =
        "<tr><td colspan='3'>Aucune intervention à prévoir</td></tr>";
      return;
    }

    const diffKms     = info.prochainKms - dernierKms;
    const joursRest   = diffKms / moyenne;
    const dateEstimee = new Date(Date.now() + joursRest * 86_400_000);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${info.intervention}</td>
      <td>${info.prochainKms.toLocaleString()} km</td>
      <td>${dateEstimee.toLocaleDateString()}</td>
    `;
    tbody.appendChild(tr);
  };

  /* ---- Lancement ---- */
  const moyenne      = getMoyenne();              // km / jour
  const dernierKms   = getDernierKilometrage();   // km actuel
  const prochaine    = getProchaineIntervention(dernierKms);

  // Pour déboguer : regarde ces valeurs dans la console
  console.log({ moyenne, dernierKms, prochaine });

  updateTableProchain(prochaine, dernierKms, moyenne);
});
