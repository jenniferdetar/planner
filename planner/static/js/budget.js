(function() {
  function applyCheckbookActuals() {
    const budgetTable = document.querySelector("#budget");
    if (!budgetTable) return;

    const actuals = opusStorage.getBudgetActuals();

    budgetTable.querySelectorAll("tbody tr").forEach(row => {
      const item = row.querySelector(".item")?.textContent.trim();
      const budget = parseMoney(row.querySelector(".budget-amount")?.textContent);
      if (!item) return;

      const actual = parseFloat(actuals[item]) || 0;
      const variance = budget - actual;

      const actualCell = row.querySelector(".actual-amount");
      const varianceCell = row.querySelector(".variance");

      if (actualCell) actualCell.textContent = `$${formatMoney(actual)}`;
      if (varianceCell) {
        varianceCell.textContent = `$${formatMoney(variance)}`;
        varianceCell.classList.remove("positive", "negative");
        varianceCell.classList.add(variance < 0 ? "negative" : "positive");
      }
    });
  }

  function loadBudgetInputs() {
    const rows = document.querySelectorAll("#checkbook tr[data-item]");
    const inputsData = opusStorage.getBudgetInputs();
    rows.forEach(row => {
      const item = row.dataset.item;
      if (!inputsData[item]) return;
      const inputs = row.querySelectorAll("input.money-input");
      inputs.forEach(input => {
        const colKey = input.dataset.col;
        if (inputsData[item][colKey] !== undefined) {
          input.value = inputsData[item][colKey];
        }
      });
    });
  }

  function parseMoney(text) {
    if (!text) return 0;
    return parseFloat(text.replace(/[$,]/g, "")) || 0;
  }

  function formatMoney(value) {
    return value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function formatInputCurrency(value) {
    if (!Number.isFinite(value)) return "";
    return `$${formatMoney(Math.round(value))}`;
  }

  function parseInputValue(input) {
    return parseMoney(input.value);
  }

  const autoAssignments = {
    Jennifer: new Set([
      "ADT",
      "Blow",
      "Cleaning Lady",
      "Hair",
      "Jennifer's Student Loans",
      "Mercury Auto Insurance",
      "Orkin",
      "Schools First Loan",
      "Spectrum",
      "Verizon"
    ]),
    Jeff: new Set([
      "HELOC",
      "HOA",
      "Mortgage",
      "Jeff's Credit Cards"
    ])
  };

  function calculateAndApplyTithe() {
    const incomeInputs = document.querySelectorAll("#checkbook input.income-input");
    const titheRow = document.querySelector('#checkbook tr[data-item="Tithe"]');
    if (!titheRow) return;

    let totalIncome = 0;
    const incomeByCol = { jf1: 0, j1: 0, j2: 0 };

    incomeInputs.forEach(input => {
      const value = parseInputValue(input);
      totalIncome += value;
      const colKey = input.dataset.col;
      if (colKey && Object.prototype.hasOwnProperty.call(incomeByCol, colKey)) {
        incomeByCol[colKey] += value;
      }
    });

    const titheAmount = totalIncome * 0.1;
    const budgetCell = titheRow.querySelector(".budget-col");
    if (budgetCell) {
      budgetCell.textContent = `$${formatMoney(titheAmount)}`;
    }

    const budgetTable = document.querySelector("#budget");
    if (budgetTable) {
      const budgetTableRows = budgetTable.querySelectorAll("tbody tr");
      budgetTableRows.forEach(row => {
        const item = row.querySelector(".item")?.textContent.trim();
        if (item === "Tithe") {
          const budgetAmountCell = row.querySelector(".budget-amount");
          if (budgetAmountCell) {
            budgetAmountCell.textContent = `$${formatMoney(titheAmount)}`;
          }
        }
      });
    }

    const inputs = titheRow.querySelectorAll("input.tithe-input");
    Object.entries(columnIndex).forEach(([colKey, index]) => {
      const input = inputs[index];
      if (!input) return;

      // Respect manual override
      if (input.value !== "" && input.dataset.auto !== "true") return;

      const colIncome = incomeByCol[colKey];
      let titheForCol = 0;
      if (totalIncome > 0) {
        titheForCol = (colIncome / totalIncome) * titheAmount;
      }
      
      if (colIncome > 0 || totalIncome > 0) {
        input.value = formatInputCurrency(titheForCol);
        input.dataset.auto = "true";
      } else {
        input.value = "";
        input.dataset.auto = "false";
      }
    });
  }

  const columnIndex = { jf1: 0, j1: 1, j2: 2 };
  const columnPerson = { jf1: "Jeff", j1: "Jennifer", j2: "Jennifer" };

  function applyAutoAllocations(colKey, hasIncome) {
    const person = columnPerson[colKey];
    const assigned = autoAssignments[person];
    const rows = document.querySelectorAll("#checkbook tr[data-item]");
    rows.forEach(row => {
      const item = row.dataset.item;
      if (!assigned.has(item)) return;
      const budget = parseMoney(row.querySelector(".budget-col")?.textContent);
      const inputs = row.querySelectorAll("input.money-input");
      const target = inputs[columnIndex[colKey]];
      if (!target) return;
      if (!hasIncome) {
        if (target.dataset.auto === "true") {
          target.value = "";
          target.dataset.auto = "false";
        }
        return;
      }

      // If user has already manually entered a value, don't override it unless it was an auto-value
      if (target.value !== "" && target.dataset.auto !== "true") return;

      let amount = 0;
      if (colKey === "jf1") {
        amount = budget;
      } else {
        amount = Math.ceil(budget / 2);
      }
      target.value = formatInputCurrency(amount);
      target.dataset.auto = "true";
    });
  }

  function calculateRow(row) {
    const inputs = row.querySelectorAll("input.money-input");
    const budgetCell = row.querySelector(".budget-col");
    const actualCell = row.querySelector(".actual-col");
    const remainingCell = row.querySelector(".remaining-col");
    if (!budgetCell || !actualCell || !remainingCell) return;

    const budget = parseMoney(budgetCell.textContent);
    let actual = 0;
    inputs.forEach(input => {
      actual += parseInputValue(input);
    });

    actualCell.textContent = `$${formatMoney(actual)}`;
    remainingCell.textContent = `$${formatMoney(budget - actual)}`;
  }

  function calculateSection(sectionName) {
    const rows = document.querySelectorAll(`#checkbook tr[data-section="${sectionName}"]`);
    const totalRow = document.querySelector(`#checkbook tr[data-section-total="${sectionName}"]`);
    if (!totalRow) return;

    let budgetTotal = 0;
    const payTotals = { jf1: 0, j1: 0, j2: 0 };
    let actualTotal = 0;
    let remainingTotal = 0;

    rows.forEach(row => {
      const budget = parseMoney(row.querySelector(".budget-col")?.textContent);
      let actual = 0;
      const inputs = row.querySelectorAll("input.money-input");
      inputs.forEach(input => {
        const value = parseInputValue(input);
        actual += value;
        const colKey = input.dataset.col;
        if (colKey && Object.prototype.hasOwnProperty.call(payTotals, colKey)) {
          payTotals[colKey] += value;
        }
      });

      budgetTotal += budget;
      actualTotal += actual;
      remainingTotal += (budget - actual);
    });

    const cells = totalRow.querySelectorAll("td");
    cells[1].textContent = `$${formatMoney(budgetTotal)}`;
    cells[2].textContent = `$${formatMoney(payTotals.jf1)}`;
    cells[4].textContent = `$${formatMoney(payTotals.j1)}`;
    cells[6].textContent = `$${formatMoney(payTotals.j2)}`;
    cells[8].textContent = `$${formatMoney(actualTotal)}`;
    cells[9].textContent = `$${formatMoney(remainingTotal)}`;
  }

  function calculateGrandTotals() {
    const sections = ["Auto", "Bill Pay", "Cash", "Credit Card", "Housing", "Savings"];
    let budgetTotal = 0;
    let jf1Total = 0;
    let j1Total = 0;
    let j2Total = 0;
    let actualTotal = 0;
    let remainingTotal = 0;

    sections.forEach(section => {
      const totalRow = document.querySelector(`#checkbook tr[data-section-total="${section}"]`);
      if (!totalRow) return;
      const cells = totalRow.querySelectorAll("td");
      budgetTotal += parseMoney(cells[1].textContent);
      jf1Total += parseMoney(cells[2].textContent);
      j1Total += parseMoney(cells[4].textContent);
      j2Total += parseMoney(cells[6].textContent);
      actualTotal += parseMoney(cells[8].textContent);
      remainingTotal += parseMoney(cells[9].textContent);
    });

    const grandBudget = document.getElementById("grand-budget");
    const grandJf1 = document.getElementById("grand-jf1");
    const grandJ1 = document.getElementById("grand-j1");
    const grandJ2 = document.getElementById("grand-j2");
    const grandActual = document.getElementById("grand-actual");
    const grandRemaining = document.getElementById("grand-remaining");

    if (grandBudget) grandBudget.textContent = `$${formatMoney(budgetTotal)}`;
    if (grandJf1) grandJf1.textContent = `$${formatMoney(jf1Total)}`;
    if (grandJ1) grandJ1.textContent = `$${formatMoney(j1Total)}`;
    if (grandJ2) grandJ2.textContent = `$${formatMoney(j2Total)}`;
    if (grandActual) grandActual.textContent = `$${formatMoney(actualTotal)}`;
    if (grandRemaining) grandRemaining.textContent = `$${formatMoney(remainingTotal)}`;

    const allocatedBudget = document.getElementById("allocated-budget");
    const allocatedJf1 = document.getElementById("allocated-jf1");
    const allocatedJ1 = document.getElementById("allocated-j1");
    const allocatedJ2 = document.getElementById("allocated-j2");
    const allocatedActual = document.getElementById("allocated-actual");
    const allocatedRemaining = document.getElementById("allocated-remaining");

    if (allocatedBudget) allocatedBudget.textContent = `$${formatMoney(budgetTotal)}`;
    if (allocatedJf1) allocatedJf1.textContent = `$${formatMoney(jf1Total)}`;
    if (allocatedJ1) allocatedJ1.textContent = `$${formatMoney(j1Total)}`;
    if (allocatedJ2) allocatedJ2.textContent = `$${formatMoney(j2Total)}`;
    if (allocatedActual) allocatedActual.textContent = `$${formatMoney(actualTotal)}`;
    if (allocatedRemaining) allocatedRemaining.textContent = `$${formatMoney(remainingTotal)}`;

    const incomeInputs = document.querySelectorAll("#checkbook input.income-input");
    let incomeTotal = 0;
    const incomeByCol = { jf1: 0, j1: 0, j2: 0 };
    incomeInputs.forEach(input => {
      const value = parseInputValue(input);
      incomeTotal += value;
      const colKey = input.dataset.col;
      if (colKey && Object.prototype.hasOwnProperty.call(incomeByCol, colKey)) {
        incomeByCol[colKey] += value;
      }
    });
    const incomeActual = document.getElementById("income-actual");
    const incomeRemaining = document.getElementById("income-remaining");
    if (incomeActual && incomeRemaining) {
      incomeActual.textContent = `$${formatMoney(incomeTotal)}`;
      incomeRemaining.textContent = `$${formatMoney(incomeTotal - actualTotal)}`;
    }

    const netBudget = document.getElementById("net-budget");
    const netJf1 = document.getElementById("net-jf1");
    const netJ1 = document.getElementById("net-j1");
    const netJ2 = document.getElementById("net-j2");
    const netActual = document.getElementById("net-actual");
    const netRemaining = document.getElementById("net-remaining");

    if (netBudget) netBudget.textContent = `$${formatMoney(incomeTotal - budgetTotal)}`;
    if (netJf1) netJf1.textContent = `$${formatMoney(incomeByCol.jf1 - jf1Total)}`;
    if (netJ1) netJ1.textContent = `$${formatMoney(incomeByCol.j1 - j1Total)}`;
    if (netJ2) netJ2.textContent = `$${formatMoney(incomeByCol.j2 - j2Total)}`;
    if (netActual) netActual.textContent = `$${formatMoney(incomeTotal - actualTotal)}`;
    if (netRemaining) netRemaining.textContent = `$${formatMoney(incomeTotal - budgetTotal)}`;
  }

  function saveCheckbookActuals() {
    const rows = document.querySelectorAll("#checkbook tr[data-item]");
    const actuals = {};
    const inputsData = {};
    rows.forEach(row => {
      const item = row.dataset.item;
      const inputs = row.querySelectorAll("input.money-input");
      let actual = 0;
      inputsData[item] = {};
      inputs.forEach(input => {
        actual += parseInputValue(input);
        inputsData[item][input.dataset.col] = input.value;
      });
      actuals[item] = actual;
    });
    opusStorage.setBudgetActuals(actuals);
    opusStorage.setBudgetInputs(inputsData);
  }

  function recalcAll() {
    calculateAndApplyTithe();
    const rows = document.querySelectorAll("#checkbook tr[data-section]");
    rows.forEach(calculateRow);
    ["Auto", "Bill Pay", "Cash", "Credit Card", "Housing", "Savings"].forEach(calculateSection);
    calculateGrandTotals();
    updatePayWeekRemaining();
    saveCheckbookActuals();
    applyCheckbookActuals();
  }

  function updatePayWeekRemaining() {
    const table = document.getElementById("checkbook");
    if (!table) return;

    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const incomeRow = rows.find(row => {
      const firstCell = row.querySelector("td");
      return row.classList.contains("summary-row") && firstCell && firstCell.textContent.trim() === "Income";
    });

    const running = { jf1: 0, j1: 0, j2: 0 };

    Object.keys(running).forEach(key => {
      const input = incomeRow?.querySelector(`input.money-input[data-col="${key}"]`);
      running[key] = parseInputValue(input || { value: "" });
      const cell = incomeRow?.querySelector(`.pay-remaining[data-col="${key}"]`);
      if (cell) {
        cell.textContent = running[key] ? `$${formatMoney(running[key])}` : "";
      }
    });

    rows.forEach(row => {
      if (row === incomeRow) return;
      Object.keys(running).forEach(key => {
        const cell = row.querySelector(`.pay-remaining[data-col="${key}"]`);
        if (!cell) return;
        const input = row.querySelector(`input.money-input[data-col="${key}"]`);
        if (input) {
          const spent = parseInputValue(input);
          running[key] = (running[key] || 0) - spent;
        }
        cell.textContent = `$${formatMoney(running[key])}`;
      });
    });
  }

  function initInputFormatting() {
    const inputs = document.querySelectorAll("#checkbook input.money-input");
    inputs.forEach(input => {
      input.type = "text";
      input.inputMode = "numeric";

      input.addEventListener("focus", () => {
        input.value = input.value.replace(/[$,]/g, "");
      });

      input.addEventListener("blur", () => {
        if (!input.value.trim()) {
          input.value = "";
          return;
        }
        const value = parseMoney(input.value);
        input.value = formatInputCurrency(value);
      });
    });
  }

  function normalizeBudgetDisplay() {
    document.querySelectorAll("#budget .budget-amount").forEach(cell => {
      const value = parseMoney(cell.textContent);
      cell.textContent = `$${formatMoney(value)}`;
    });

    document.querySelectorAll("#checkbook .budget-col").forEach(cell => {
      const value = parseMoney(cell.textContent);
      if (value === 0 && cell.textContent.trim() === "") return;
      cell.textContent = `$${formatMoney(value)}`;
    });
  }

  async function initCheckbook() {
    const checkbookTable = document.getElementById("checkbook");
    if (!checkbookTable) return;

    if (window.opusStorage) {
      await window.opusStorage.initializeStorage();
    }

    loadBudgetInputs();
    initInputFormatting();
    normalizeBudgetDisplay();
    recalcAll();

    checkbookTable.addEventListener("input", event => {
      const target = event.target;
      if (!target.matches("input.money-input")) return;
      if (!target.classList.contains("income-input")) {
        target.dataset.auto = "false";
        recalcAll();
        return;
      }
      const colKey = target.dataset.col;
      if (colKey) {
        applyAutoAllocations(colKey, target.value !== "");
      }
      recalcAll();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCheckbook();
  });
})();
