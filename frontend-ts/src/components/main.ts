import { CustomHttp } from '../services/custom-http';
import config from '../../config/config';

import {
  Chart,
  PieController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

Chart.register(CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement, PieController);

// Types
import { OperationsResponseType } from '../types/operations-response.type';
import { DefaultResponseType } from '../types/default-response.type';

import { funcShared } from '../utils/funcs-shared';

export class Main {
  readonly period: string | null;
  private activeFilterButton: HTMLButtonElement | null;
  private query: {
    period: string | null;
    dateTo: string | null;
    dateFrom: string | null;
  };
  private operationsData: OperationsResponseType[];
  private operationsRoute: string;
  private operationsIncomeData: OperationsResponseType[];
  private operationsExpenseData: OperationsResponseType[];

  constructor(period: string = '') {
    this.period = period;
    this.activeFilterButton = null;
    this.query = { period: period, dateFrom: null, dateTo: null };
    this.operationsData = [];
    this.operationsRoute = '/main';
    this.operationsIncomeData = [];
    this.operationsExpenseData = [];

    this.init();
  }

  private init(): void {
    const that: Main = this;
    const filterButtons = Array.from(
      document.getElementsByClassName('period')
    ) as HTMLButtonElement[];
    const applyBtn: HTMLElement | null = funcShared('applyBtn');
    const modal: HTMLElement | null = funcShared('intervalModal');
    const dateInputs = Array.from(
      document.getElementsByClassName('date-input')
    ) as HTMLInputElement[];
    const intervalBlock: HTMLElement | null = funcShared('interval-block');

    this.activeFilterButton = Array.from(filterButtons).find((item) => {
      if (item instanceof HTMLElement) {
        return item.id === this.period;
      }
      return false;
    }) as HTMLButtonElement | null;

    if (this.activeFilterButton) {
      this.activeFilterButton.classList.add('active');
    }

    if (this.period === 'interval') {
      Array.from(dateInputs).forEach((item) => {
        if (item instanceof HTMLElement) {
          item.classList.remove('d-none');
        }
      });
    }

    this.showData();

    for (const button of filterButtons) {
      button.onclick = function () {
        if (that.activeFilterButton) {
          that.activeFilterButton.classList.remove('active');
          if (button instanceof HTMLButtonElement) {
            button.classList.add('active');
            that.activeFilterButton = button;
            location.href = '/#' + that.operationsRoute + '?period=' + button.id;
          }
        }
      };
    }

    if (modal) {
      if (this.activeFilterButton) {
        if (this.activeFilterButton.id === 'interval') {
          modal.style.display = 'block';
        }
      }

      modal.querySelector('.close')?.addEventListener('click', () => {
        modal.style.display = 'none';
      });

      for (const input of dateInputs) {
        input.onchange = function () {
          if (this instanceof HTMLInputElement) {
            that.query[this.id as keyof typeof that.query] = this.value || null;
          }
        };

        if (applyBtn) {
          applyBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            intervalBlock?.classList.add('d-flex');
            intervalBlock?.classList.remove('d-none');

            const dateFromInput: HTMLInputElement | null = document.getElementById(
              'dateFromInput'
            ) as HTMLInputElement;
            const dateToInput: HTMLInputElement | null = document.getElementById(
              'dateToInput'
            ) as HTMLInputElement;
            const dateFromValue = document.getElementById('dateFromValue');
            const dateToValue = document.getElementById('dateToValue');

            if (dateFromInput && dateToInput && dateFromValue && dateToValue) {
              dateFromValue.innerText = formatDate(dateFromInput.value);
              dateToValue.innerText = formatDate(dateToInput.value);
            }

            function formatDate(date: string, isUrlFormat: boolean = false) {
              const options: Intl.DateTimeFormatOptions = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              };

              if (isUrlFormat) {
                options.year = 'numeric';
                options.day = '2-digit';
                options.month = '2-digit';
              }

              const formattedDate = new Date(date).toLocaleDateString('ru-RU', options);

              if (isUrlFormat) {
                const match = formattedDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);

                if (match) {
                  const [, month, day, year] = match;
                  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
                return date;
              }
              return formattedDate;
            }

            // для отображения на странице
            if (dateFromInput && dateToInput && dateFromValue && dateToValue) {
              dateFromValue.innerText = formatDate(dateFromInput.value);
              dateToValue.innerText = formatDate(dateToInput.value);
            }

            // для URL
            this.query.dateFrom = formatDate(dateFromInput.value, true);
            this.query.dateTo = formatDate(dateToInput.value, true);

            intervalBlock?.classList.remove('d-none');

            that.showData();
          });
        }
      }
    }
  }

  private async showData(): Promise<void> {
    let url: string = '/operations';
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
        const result: DefaultResponseType | OperationsResponseType[] = await CustomHttp.request(
          config.host + url
        );
        console.log(result);

        if (result) {
          if ((result as DefaultResponseType).error !== undefined) {
            throw new Error((result as DefaultResponseType).message);
          }

          this.operationsData = result as OperationsResponseType[];
          this.processData();
        }
      } catch (error) {
        console.log(error);
      }
    }
    return;
  }

  private processData(): void {
    // Группировка данных по категории

    this.operationsIncomeData = this.operationsData.filter(
      (item) => item.type === 'income'
    ) as OperationsResponseType[];
    this.operationsExpenseData = this.operationsData.filter(
      (item) => item.type === 'expense'
    ) as OperationsResponseType[];

    const groupByCategory = (data: OperationsResponseType[]) => {
      const groupedData = new Map<string, OperationsResponseType[]>();
      data.forEach((item) => {
        if (groupedData.has(item.category)) {
          const existingData = groupedData.get(item.category);
          if (existingData) {
            existingData.push(item);
          }
        } else {
          groupedData.set(item.category, [item]);
        }
      });
      return groupedData;
    };

    const groupedIncomeData = groupByCategory(this.operationsIncomeData);
    const groupedExpenseData = groupByCategory(this.operationsExpenseData);

    // console.log(groupedIncomeData);
    // console.log(groupedExpenseData);

    // Отрисовка диаграммы доходов
    this.drawChart(groupedIncomeData, 'incomeChartCanvas');

    // Отрисовка диаграммы расходов
    this.drawChart(groupedExpenseData, 'expenseChartCanvas');
  }

  drawChart(data: Map<string, OperationsResponseType[]>, elementId: string) {
    const labels = Array.from(data.keys());
    const values = Array.from(data.values()).map((items) =>
      items.reduce((acc, item) => acc + item.amount, 0)
    );
    // console.log(labels);
    // console.log(values);

    const colors = ['#DC3545', '#20C997', '#0D6EFD', '#FFC107', '#FD7E14', '#AF79B7', '#4CCAD5'];

    const ctx: CanvasRenderingContext2D | null = (
      document.getElementById(elementId) as HTMLCanvasElement
    )?.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'pie',
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
}
