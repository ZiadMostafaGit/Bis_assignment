document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector('input[name="search"]');
    const searchResults = document.getElementById('ttable');
    const searchh = document.getElementById('tttable');
    let totalSalesPrice = 0;
    let displayedResults = [];

    function calculateTotalPrice() {
        totalSalesPrice = 0;
        displayedResults.forEach(result => {
            if (result[4] && result[4] > 0) {
                totalSalesPrice += result[4] * result[2];
            }
        });

        const totalPriceElement = document.getElementById('totalPrice');
        if (totalPriceElement) {
            totalPriceElement.textContent = `Total Price: $${totalSalesPrice.toFixed(2)}`;
        }
    }

    searchResults.addEventListener('click', function (event) {
        const target = event.target;
        if (target.tagName === 'BUTTON') {
            const row = target.closest('tr');
            const index = Array.from(row.parentNode.children).indexOf(row);
            const result = displayedResults[index];
            if (result) {
                if (target.textContent === '+') {
                    result[4] = (result[4] || 0) + 1;
                } else if (target.textContent === '-') {
                    if (result[4] && result[4] > 0) {
                        result[4]--;
                    }
                } else if (target.textContent === 'Reset') {
                    const index = displayedResults.indexOf(result);
                    if (index > -1) {
                        displayedResults.splice(index, 1);
                        renderSearchResults(displayedResults);
                        calculateTotalPrice();
                    }
                }
                renderSearchResults(displayedResults);
                calculateTotalPrice();
            }
        }
    });

    function search(query) {
        let table = "";

        if (query.trim() !== "") {
            fetch('/search_sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ search_sales: query }),
            })
            .then(response => response.json())
            .then(data => {
                data.forEach(medicine => {
                    table += `
                        <tr>
                            <td>${medicine[0]}</td>
                            <td>${medicine[1]}</td>
                            <td>${medicine[3]}</td>
                            <td style="display: flex; justify-content: space-between;">
                                <span class="quantity-sold">${medicine[4] || 0}</span>
                            </td>
                            <td>${medicine[2]}</td>
                            <td>${medicine[6]}</td>
                            <td>
                                <button class="addBtn">Add</button>
                            </td>
                        </tr>
                    `;
                });

                searchh.innerHTML = table;
                calculateTotalPrice();
                const addBtns = document.querySelectorAll('.addBtn');
                addBtns.forEach((btn, index) => {
                    btn.addEventListener('click', function () {
                        displayedResults.push(data[index]);
                        renderSearchResults(displayedResults);
                        calculateTotalPrice();
                    });
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }

    searchInput.addEventListener('keyup', function () {
        search(this.value);
    });

    function renderSearchResults(results) {
        searchResults.innerHTML = '';

        results.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result[0]}</td>
                <td>${result[1]}</td>
                <td>${result[3]}</td>
                <td style="display: flex; justify-content: space-between;">
                    <span class="quantity-sold">${result[4] || 0}</span>
                </td>
                <td>${result[2]}</td>
                <td>${result[6]}</td>
                <td>
                    <button class="increaseBtn">+</button>
                    <button class="decreaseBtn">-</button>
                    <button class="resetBtn">Reset</button>
                </td>
            `;

            const increaseBtn = row.querySelector('.increaseBtn');
            increaseBtn.addEventListener('click', function () {
                result[4] = (result[4] || 0) + 1;
                row.querySelector('.quantity-sold').textContent = result[4];
                calculateTotalPrice();
            });

            const decreaseBtn = row.querySelector('.decreaseBtn');
            decreaseBtn.addEventListener('click', function () {
                if (result[4] && result[4] > 0) {
                    result[4]--;
                    row.querySelector('.quantity-sold').textContent = result[4];
                    calculateTotalPrice();
                }
            });

            const resetBtn = row.querySelector('.resetBtn');
            resetBtn.addEventListener('click', function () {
                const index = displayedResults.indexOf(result);
                if (index > -1) {
                    displayedResults.splice(index, 1);
                    renderSearchResults(displayedResults);
                    calculateTotalPrice();
                }
            });

            searchResults.appendChild(row);
        });
    }

    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', function () {
        location.reload();
    });
});
