## Expense/income accounting system 🧾

The layout (desktop only) is implemented using Bootstrap with minimal redefinition of styles.

✔️ user has the opportunity to register or log in to an account, and also log out;</br>
✔️ sidebar displays the user’s full name specified during registration and current balance for operations;</br>
✔️ income/expenses tabs display the corresponding categories with which you can perform a number of actions: you can edit or delete existing categories, as well as add new ones;</br>
✔️ income and expenses tab displays a table with all operations that can be edited, deleted, or created a new one if necessary;</br>
✔️ balance in the sidebar will automatically change with changes in operation's balance;</br>
✔️ main page displays income and expense operations, but separately and in graphical form using chart.js;</br>
✔️ on the page with operations and on the main page, filtering by dates is configured;

_All of the above actions are accompanied by http-requests to the server._


run backend -> `npm start` <br>
run  frontend -> `npm run dev` / `npm run build` 
