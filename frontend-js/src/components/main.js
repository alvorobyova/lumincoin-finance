import {CustomHttp} from "../services/custom-http.js";
import {UrlManager} from "../utils/url-manager.js";
import config from "../../config/config.js";
import {Chart, PieController, CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement} from "../../node_modules/chart.js/dist/chart.js";
Chart.register(CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement, PieController);

export class Main {
  constructor(period) {
    this.period = period;
    this.activeFilterButton = null;
    this.query = {period: period, dateFrom: null, dateTo: null};
    this.operationsData = null;
    this.operationsIncomeData = null;
    this.operationsExpenseData = null;
    this.operationsRoute = '/main';

    this.init();
  }

  init() {
    const that = this;
    const filterButtons = document.getElementsByClassName('period');
    const applyBtn = document.getElementById('applyBtn');
    const modal = document.getElementById('intervalModal');
    const dateInputs = document.getElementsByClassName('date-input');
    const intervalBlock = document.getElementById('interval-block');

    this.activeFilterButton = Array.from(filterButtons).find(item => item.id === this.period);
    if (this.activeFilterButton) {
      this.activeFilterButton.classList.add('active');
    }

    if (this.period === 'interval') {
      Array.from(dateInputs).forEach(item => item.classList.remove('d-none'))
    }

    this.showData();

    for (const button of filterButtons) {
      button.onclick = function () {
        if (that.activeFilterButton) {
          that.activeFilterButton.classList.remove('active');
          this.classList.add('active');
          that.activeFilterButton = this;
          location.href = '/#' + that.operationsRoute + '?period=' + that.activeFilterButton.id;
        }
      }
    }

    if (this.activeFilterButton.id === 'interval') {
      modal.style.display = "block";
    }

    modal.querySelector(".close").addEventListener("click", () => {
      modal.style.display = "none";
    });

    for (const input of dateInputs) {
      input.onchange = function () {
        that.query[this.id] = this.value ? this.value : null;
      }

      applyBtn.addEventListener("click", () => {
        modal.style.display = "none";
        intervalBlock.classList.add('d-flex');
        intervalBlock.classList.remove('d-none');

        const dateFromInput = document.getElementById('dateFromInput');
        const dateToInput = document.getElementById('dateToInput');
        const dateFromValue = document.getElementById('dateFrom').value;
        const dateToValue = document.getElementById('dateTo').value;


        function formatDate(date) {
          const options = {day: '2-digit', month: '2-digit', year: 'numeric'};
          return new Date(date).toLocaleDateString('ru-RU', options);
        }

        dateFromInput.innerText = formatDate(dateFromValue);
        dateToInput.innerText = formatDate(dateToValue);

        intervalBlock.classList.remove('d-none');

        that.showData();
      });
    }
  }

  async showData() {
    let url = '/operations';
    if (this.query.period) {
      url += '?period=' + this.query.period;
      if (this.query.period === 'interval') {
        if (this.query.dateFrom && this.query.dateTo) {
          url += '&dateFrom=' + this.query.dateFrom + '&dateTo=' + this.query.dateTo;

        } else {
          return;
        }
      }
      try {
        const result = await CustomHttp.request(config.host + url);
        console.log(result);

        if (result) {
          if (result.error) {
            throw new Error(result.error);
          }
          this.operationsData = result;
          console.log(result);

          this.processData();
          this.drawChart();
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  }

  processData() {
    // Группировка данных по категории

    this.operationsIncomeData = this.operationsData.filter(item => item.type === "income");
    this.operationsExpenseData = this.operationsData.filter(item => item.type === "expense");
    console.log(this.operationsIncomeData)
    console.log(this.operationsExpenseData)
    const groupByCategory = (data) => {
      const groupedData = new Map();
      data.forEach(item => {
        if (groupedData.has(item.category)) {
          groupedData.get(item.category).push(item);
        } else {
          groupedData.set(item.category, [item]);
        }
      });
      return groupedData;
    };

    const groupedIncomeData = groupByCategory( this.operationsIncomeData);
    const groupedExpenseData = groupByCategory(this.operationsExpenseData);

    console.log(groupedIncomeData)
    console.log(groupedExpenseData)

    // Отрисовка диаграммы доходов
    this.drawChart(groupedIncomeData, "incomeChartCanvas");

// Отрисовка диаграммы расходов
    this.drawChart(groupedExpenseData, "expenseChartCanvas");
  }


  drawChart(data, elementId) {
    const labels = Array.from(data.keys());
    const values = Array.from(data.values()).map(items => items.reduce((acc, item) => acc + item.amount, 0));
    // console.log(labels)
    // console.log(values)

    const colors = ['#DC3545', '#20C997', '#0D6EFD', '#FFC107', '#FD7E14'];

    const ctx = document.getElementById(elementId).getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
          },
        ],
      },
    });
  }


}