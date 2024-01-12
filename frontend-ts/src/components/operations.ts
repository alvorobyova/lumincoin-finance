import { CustomHttp } from "../services/custom-http";
import { UrlManager } from "../utils/url-manager";
import config from "../../config/config";

// Types
import { OperationsResponseType } from "../types/operations-response.type";
import { QueryParamsType } from "../types/query-params.type";
import { DefaultResponseType } from "../types/default-response.type";

export class Operations {
  readonly period: string;
  private activeFilterButton: HTMLButtonElement | null;
  private query: {
    period: string | null;
    dateTo: string | null;
    dateFrom: string | null;
  };
  private operationsData: OperationsResponseType[];
  readonly operationsRoute: string;
  private routeParams: QueryParamsType;

  constructor(period: string = "") {
    this.period = period;
    this.activeFilterButton = null;
    this.query = { period: period, dateFrom: null, dateTo: null };
    this.operationsData = [];
    this.operationsRoute = "/operations";
    this.routeParams = UrlManager.getQueryParams();

    this.init();
  }

  private init(): void {
    const that: Operations = this;
    const filterButtons = Array.from(
      document.getElementsByClassName("period")
    ) as HTMLButtonElement[];
    const applyBtn: HTMLElement | null = document.getElementById("applyBtn");
    const modal: HTMLElement | null = document.getElementById("intervalModal");
    const dateInputs = Array.from(
      document.getElementsByClassName("date-input")
    ) as HTMLInputElement[];
    const intervalBlock: HTMLElement | null =
      document.getElementById("interval-block");

    this.activeFilterButton = Array.from(filterButtons).find((item) => {
      if (item instanceof HTMLElement) {
        return item.id === this.period;
      }
      return false;
    }) as HTMLButtonElement | null;

    if (this.activeFilterButton) {
      this.activeFilterButton.classList.add("active");
    }

    if (this.period === "interval") {
      Array.from(dateInputs).forEach((item) => {
        if (item instanceof HTMLElement) {
          item.classList.remove("d-none");
        }
      });
    }

    this.showData();

    for (const button of filterButtons) {
      button.onclick = function () {
        if (that.activeFilterButton) {
          that.activeFilterButton.classList.remove("active");
          if (button instanceof HTMLButtonElement) {
            button.classList.add("active");
            that.activeFilterButton = button;
            location.href =
              "/#" + that.operationsRoute + "?period=" + button.id;
          }
        }
      };
    }

    if (modal) {
      if (this.activeFilterButton) {
        if (this.activeFilterButton.id === "interval") {
          modal.style.display = "block";
        }
      }

      modal.querySelector(".close")?.addEventListener("click", () => {
        modal.style.display = "none";
      });

      for (const input of dateInputs) {
        input.onchange = function () {
          if (this instanceof HTMLInputElement) {
            that.query[this.id as keyof typeof that.query] = this.value || null;
          }
        };

        if (applyBtn) {
          applyBtn.addEventListener("click", () => {
            modal.style.display = "none";
            intervalBlock?.classList.add("d-flex");
            intervalBlock?.classList.remove("d-none");

            const dateFromInput: HTMLInputElement | null =
              document.getElementById("dateFromInput") as HTMLInputElement;
            const dateToInput: HTMLInputElement | null =
              document.getElementById("dateToInput") as HTMLInputElement;
            const dateFromValue = document.getElementById("dateFromValue");
            const dateToValue = document.getElementById("dateToValue");

            if (dateFromInput && dateToInput && dateFromValue && dateToValue) {
              dateFromValue.innerText = formatDate(dateFromInput.value);
              dateToValue.innerText = formatDate(dateToInput.value);
            }

            function formatDate(date: string, isUrlFormat: boolean = false) {
              const options: Intl.DateTimeFormatOptions = {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              };

              if (isUrlFormat) {
                options.year = "numeric";
                options.day = "2-digit";
                options.month = "2-digit";
              }

              const formattedDate = new Date(date).toLocaleDateString(
                "ru-RU",
                options
              );

              if (isUrlFormat) {
                const match = formattedDate.match(
                  /(\d{1,2})\/(\d{1,2})\/(\d{4})/
                );

                if (match) {
                  const [, month, day, year] = match;
                  return `${year}-${month.padStart(2, "0")}-${day.padStart(
                    2,
                    "0"
                  )}`;
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

            intervalBlock?.classList.remove("d-none");

            that.showData();
          });
        }
      }
    }

    const createExpense = document.getElementById("add-expense");
    if (createExpense) {
      createExpense.addEventListener("click", () => {
        location.href = `/#/operations/expense/add`;
      });
    }

    const createIncome = document.getElementById("add-income");
    if (createIncome) {
      createIncome.addEventListener("click", () => {
        location.href = `/#/operations/income/add`;
      });
    }
  }

  private async showData(): Promise<void> {
    let url: string = "/operations";
    if (this.query.period) {
      url += "?period=" + this.query.period;
      if (this.query.period === "interval") {
        if (this.query.dateFrom && this.query.dateTo) {
          url +=
            "&dateFrom=" + this.query.dateFrom + "&dateTo=" + this.query.dateTo;
          console.log(url);
        } else {
          return;
        }
      }
      try {
        const result: DefaultResponseType | OperationsResponseType[] =
          await CustomHttp.request(config.host + url);

        if (result) {
          if ((result as DefaultResponseType).error !== undefined) {
            throw new Error((result as DefaultResponseType).message);
          }
          this.operationsData = result as OperationsResponseType[];
          this.fillTable();
        }
      } catch (error) {
        console.log(error);
      }
    }
    return;
  }

  private fillTable(): void {
    if (!this.operationsData) return;

    const operationsTableBody: HTMLElement | null =
      document.getElementById("data-table-body");

    if (operationsTableBody) {
      operationsTableBody.innerHTML = "";

      const that: Operations = this;
      const operationsTableHeadRow: HTMLElement | null =
        document.getElementById("head-table");

      if (operationsTableHeadRow) {
        this.operationsData.forEach((operation: OperationsResponseType) => {
          const operationElement: HTMLTableRowElement | null =
            document.createElement("tr");
          let operationId: string | null = null;
          for (let colHeader of Array.from(operationsTableHeadRow.children)) {
            const prop: string = colHeader.className;
            const operationProp: HTMLTableCellElement =
              document.createElement("td");
            operationProp.classList.add("col", prop);
            const operationValue =
              operation[prop as keyof OperationsResponseType];
            if (operation.hasOwnProperty(prop)) {
              if (prop === "id") {
                operationProp.classList.add("fw-bold");
                operationId = operation[prop].toString();
              }
              if (prop === "date") {
                operationProp.innerText = new Date(
                  operationValue
                ).toLocaleDateString("ru-RU");
              } else if (prop === "type") {
                operationProp.classList.add(
                  operationValue === "income" ? "text-success" : "text-danger"
                );
                operationProp.innerText =
                  operationValue === "income" ? "доход" : "расход";
              } else {
                operationProp.innerText =
                  operationValue.toString().toLowerCase() +
                  (prop === "amount" ? "$" : "");
              }
            } else if (prop === "category") {
              operationProp.innerText = "не задано";
            }
            operationElement.appendChild(operationProp);
          }
          const operationAction: HTMLElement | null = Array.from(
            operationElement.children
          ).find((item) => item.classList.contains("actions")) as HTMLElement;
          operationAction.classList.add("pe-0", "text-end");
          const deleteOperationLink: HTMLElement | null =
            document.createElement("a");
          if (deleteOperationLink) {
            deleteOperationLink.classList.add("action-link", "me-1");
            deleteOperationLink.setAttribute("data-id", operationId || "");
            deleteOperationLink.innerHTML =
              '<svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
              '<path d="M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z" fill="black"/>\n' +
              '<path d="M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z" fill="black"/>\n' +
              '<path d="M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z" fill="black"/>\n' +
              '<path fill-rule="evenodd" clip-rule="evenodd" d="M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z" fill="black"/>\n' +
              "</svg>\n";
          }

          const editOperationLink: HTMLElement | null =
            document.createElement("a");
          if (editOperationLink) {
            editOperationLink.classList.add("action-link", "ms-2");
            editOperationLink.setAttribute("data-id", operationId || "");
            editOperationLink.innerHTML =
              '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
              '<path d="M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z" fill="black"/>\n' +
              "</svg>\n";
          }

          operationAction.appendChild(deleteOperationLink);
          operationAction.appendChild(editOperationLink);
          operationElement.appendChild(operationAction);
          operationsTableBody.appendChild(operationElement);

          editOperationLink.onclick = function () {
            that.editOperation(<HTMLElement>this);
          };

          deleteOperationLink.onclick = function () {
            that.deleteOperation(<HTMLElement>this);
          };
        });
      }
    }
  }

  private editOperation(element: HTMLElement): void {
    if (element) {
      const dataId: number | null = +element.getAttribute("data-id")!;
      if (dataId) {
        const operation = this.operationsData.find(
          (item: OperationsResponseType) => item.id === dataId
        );
        if (operation && operation.type) {
          location.href =
            "/#" +
            this.operationsRoute +
            "/" +
            operation.type +
            "/edit?id=" +
            dataId;
          this.routeParams.id = dataId.toString();
        }
      }
    }
  }

  private deleteOperation(element: HTMLElement): void {
    if (element) {
      const dataId: number | null = +element.getAttribute("data-id")!;
      const deleteModal: HTMLElement | null =
        document.getElementById("deleteModal");
      const approveDeleteButton: HTMLElement | null =
        document.getElementById("approveDelete");

      if (deleteModal) {
        deleteModal.style.display = "flex";

        if (dataId) {
          if (approveDeleteButton) {
            approveDeleteButton.onclick = async (): Promise<void> => {
              // запрос DELETE на сервер
              const result: DefaultResponseType | null =
                await CustomHttp.request(
                  config.host + this.operationsRoute + "/" + dataId,
                  "DELETE"
                );
              try {
                if (result) {
                  deleteModal.style.display = "none";
                  location.href =
                    "/#" +
                    this.operationsRoute +
                    "?period=" +
                    this.activeFilterButton?.id;
                }
              } catch (error) {
                console.log(error);
              }
              return;
            };
          }
        }

        const cancelDeleteButton = document.getElementById("cancelDelete");
        if (cancelDeleteButton) {
          cancelDeleteButton.addEventListener("click", () => {
            deleteModal.style.display = "none";
            location.href =
              "/#" +
              this.operationsRoute +
              "?period=" +
              this.activeFilterButton?.id;
          });
        }
      }
    }
  }
}
