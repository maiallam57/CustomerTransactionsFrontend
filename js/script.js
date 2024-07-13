//? npx json-server --watch data/data.json --port 3000


let customers = [];
let transactions = [];
let filteredTransactions = [];

//! ========================== loader Functions ==========================
function loaderIn() {
    $("body").addClass("overflow-hidden")
    $('.loading-screen').fadeIn(10, function () {
        $('.loading-screen').fadeOut(500, function () {
            $("body").removeClass("overflow-hidden")
        })
    })
}

function loaderOut() {
    $("body").addClass("overflow-hidden")
    $('.loading-screen').fadeOut(1000, function () {
        $("body").removeClass("overflow-hidden")
    })
}

async function fetchData() {

    try {
        let customersResponse = await fetch(`http://localhost:3000/customers`);
        customers = await customersResponse.json();
        console.log(customers);

        let transactionsResponse = await fetch(`http://localhost:3000/transactions`);
        transactions = await transactionsResponse.json();
        console.log(transactions);
        displayTransactions(transactions);

    } catch (error) {
        console.log(error);
    }
}

function displayTransactions(transactions) {
    const transactionTableBody = $('#transactionTableBody');
    transactionTableBody.empty();

    transactions.forEach(transaction => {
        const customer = customers.find(c => c.id == transaction.customer_id);
        let type = transaction.transaction_type
        if (type == "Transfer") {
            var td = `<td class="text-center"><span class="bg-primary px-5 border-1 rounded-2">${type}</span></td>`
        } else if (type == "Deposit") {
            var td = `<td class="text-center"><span class="bg-warning px-5 border-1 rounded-2">${type}</span></td>`
        } else if (type == "Payment") {
            var td = `<td class="text-center"><span class="bg-info px-5 border-1 rounded-2">${type}</span></td>`
        } else {
            var td = `<td class="text-center"><span class="bg-danger px-5 border-1 rounded-2">${type}</span></td>`
        }
        transactionTableBody.append(`
            <tr>

                <td value="COIN" class="text-center">${customer.name}</td>
                <td class="text-center">${transaction.date}</td>
                <td class="text-center">${transaction.amount}</td>
                ${td}
            </tr>
        `);
    });

    updateChart(transactions);
}

function filterTransactions() {
    loaderIn()
    const customerNameFilter = $('#customerNameFilter').val().toLowerCase();
    const transactionAmountFilter = $('#transactionAmountFilter').val();

    console.log(customerNameFilter);
    console.log(transactionAmountFilter);

    filteredTransactions = transactions.filter(transaction => {
        const customer = customers.find(c => c.id == transaction.customer_id);
        const matchesName = customer.name.toLowerCase().includes(customerNameFilter);
        const matchesAmount = transactionAmountFilter ? transaction.amount == transactionAmountFilter : true;
        return matchesName && matchesAmount;
    });

    displayTransactions(filteredTransactions);
}

function updateChart(transactions) {
    const ctx = document.getElementById('transactionChart').getContext('2d');
    const dates = [...new Set(transactions.map(transaction => transaction.date))];
    const totalAmounts = dates.map(date => {
        return transactions.filter(transaction => transaction.date == date)
            .reduce((sum, transaction) => sum + transaction.amount, 0);
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Total Transaction Amount',
                data: totalAmounts,
                borderColor: 'rgba(75, 192, 255, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            }]
        }
    });
}

$(document).ready(function () {

    //* ======================== loader ========================
    loaderOut()

    $('#customerNameFilter, #transactionAmountFilter').on('keyup', filterTransactions);

    fetchData();
});
