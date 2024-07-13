//? npx json-server --watch data/data.json --port 3000

let customers = [];
let transactions = [];
let filteredTransactions = [];

//! ==================== loader Functions ==============================
function loaderIn() {
    $("body").addClass("overflow-hidden")
    $('.loading-screen').fadeIn(1, function () {
        $('.loading-screen').fadeOut(300, function () {
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

//! ====================== Fetch Data  =================================

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

//! ========================== Display Data  ===========================

function displayTransactions(transactions) {
    const transactionTableBody = $('#transactionTableBody');
    transactionTableBody.empty();

    transactions.forEach(transaction => {
        const customer = customers.find(c => c.id == transaction.customer_id);
        let type = transaction.transaction_type
        transactionTableBody.append(`
            <tr>
                <td onclick="displayTransactionsOfCustomer(${customer.id}, '${customer.name}')" class="p-2 px-3">${customer.name}</td>
                <td class="p-2 px-3">${transaction.date}</td>
                <td class="p-2 px-3">${transaction.amount} EGP</td>
                <td class="p-2 px-3"> <p class="text-center py-1 rounded-3
                                ${type.toLowerCase()}">${type}</p></td>
            </tr>
        `);
    });
    updateChart(transactions);
}

//! ===================== Search Data  =================================

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

//! ================ Display & Update Cart  ============================

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


//! ===== Transaction Amount/day Chat For The Selected Customer  ======

function calculateTotalAmountPerDay(transactions, customerId) {
    var dataPoints = [];

    // Group transactions by date and sum amounts
    var groupedTransactions = transactions.reduce(function (acc, transaction) {
        if (transaction.customer_id === customerId) {
            var date = transaction.date;
            acc[date] = acc[date] || 0;
            acc[date] += transaction.amount;
        }
        return acc;
    }, {});

    // Prepare data points for CanvasJS
    for (var date in groupedTransactions) {
        dataPoints.push({ x: new Date(date), y: groupedTransactions[date] });
    }

    return dataPoints;
}

function displayTransactionsOfCustomer(customerId, customerName) {
    var chart = new CanvasJS.Chart("chartContainer", {
        title: {
            text: "Total Transaction Amount per Day"
        },
        axisX: {
            title: "Date",
            valueFormatString: "DD MMM YYYY"
        },
        axisY: {
            title: "Amount",
            includeZero: false
        },
        data: [{
            type: "spline",
            name: "Transaction Amount",
            dataPoints: []
        }]
    });

    chart.render();

    var dataPoints = calculateTotalAmountPerDay(transactions, customerId);

    // Update chart with new data points
    chart.options.data[0].dataPoints = dataPoints;
    chart.options.title.text = `Total Transaction Amount per Day for Customer ${customerName}`;
    chart.render();
}


//! ========================= Document Ready  ==========================

$(document).ready(function () {

    //* ======================== loader ========================
    loaderOut()

    $('#customerNameFilter, #transactionAmountFilter').on('keyup', filterTransactions);
    displayTransactionsOfCustomer();
    $('#CustomerName').on('click');
    fetchData();

});
