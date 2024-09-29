document.addEventListener('DOMContentLoaded', function() {
    const TARIFFS = {
        commercial: 12,
        industrial: 6.5
    };
    const RESIDENTIAL_TARIFF = [
        { limit: 100, rate: 3.7 },
        { limit: 200, rate: 3.9 },
        { limit: 400, rate: 5.3 },
        { limit: 600, rate: 6.3 },
        { limit: Infinity, rate: 7.9 }
    ];
    const COST_PER_KW = 70000;
    const AREA_PER_KW = 80;
    const KWH_PER_KW_PER_MONTH = 120;

    function updateSliderRange() {
        const customerType = document.getElementById('customerType').value;
        const slider = document.getElementById('billSlider');
        switch(customerType) {
            case 'residential':
                slider.max = "35000";
                break;
            case 'commercial':
                slider.max = "400000";
                break;
            case 'industrial':
                slider.max = "500000";
                break;
        }
        slider.value = Math.min(slider.value, slider.max);
        document.getElementById('billValue').textContent = formatNumber(slider.value);
    }

    function formatNumber(num) {
        return new Intl.NumberFormat('en-IN').format(num);
    }

    function calculateResidentialBill(consumption) {
        let bill = 0;
        let remainingUnits = consumption;
        for (let slab of RESIDENTIAL_TARIFF) {
            if (remainingUnits <= 0) break;
            let unitsInSlab = Math.min(remainingUnits, slab.limit - (slab.limit === Infinity ? 600 : RESIDENTIAL_TARIFF[RESIDENTIAL_TARIFF.indexOf(slab) - 1]?.limit || 0));
            bill += unitsInSlab * slab.rate;
            remainingUnits -= unitsInSlab;
        }
        return bill;
    }

    function estimateConsumption(monthlyBill, customerType) {
        if (customerType !== 'residential') {
            return monthlyBill / TARIFFS[customerType];
        }
        
        let low = 0;
        let high = 10000; // Assuming a high upper limit
        while (high - low > 1) {
            let mid = Math.floor((low + high) / 2);
            let estimatedBill = calculateResidentialBill(mid);
            if (estimatedBill < monthlyBill) {
                low = mid;
            } else {
                high = mid;
            }
        }
        return high;
    }

    function calculateSolar() {
        const customerType = document.getElementById('customerType').value;
        const monthlyBill = parseFloat(document.getElementById('billSlider').value);
        
        const monthlyConsumption = estimateConsumption(monthlyBill, customerType);
        const solarCapacity = Math.round(monthlyConsumption / KWH_PER_KW_PER_MONTH);
        const investment = solarCapacity * COST_PER_KW;
        const area = solarCapacity * AREA_PER_KW;

        let subsidy = 0;
        if (customerType === 'residential') {
            if (solarCapacity <= 1) {
                subsidy = 30000;
            } else if (solarCapacity > 1 && solarCapacity <= 2) {
                subsidy = 60000;
            } else if (solarCapacity >= 3) {
                subsidy = 78000;
            }
        }

        const finalCost = investment - subsidy;
        const paybackPeriod = finalCost / (monthlyBill * 12);
        const coalSaved = (monthlyConsumption * 12 * 1.14) / 2000; // 1.14 pounds per kWh, converted to tons
        const treesPlanted = solarCapacity * 1500;

        const results = `
            <div class="results-grid">
                <div class="result-item">
                    <div class="result-label">Estimated Monthly Consumption</div>
                    <div class="result-value">${Math.round(monthlyConsumption)} kWh</div>
                </div>
                <div class="result-item">
                    <div class="result-label">System Size</div>
                    <div class="result-value">${solarCapacity} kW</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Price of the System</div>
                    <div class="result-value">₹${formatNumber(Math.round(investment))}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Subsidy Available</div>
                    <div class="result-value">₹${formatNumber(Math.round(subsidy))}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Area Needed</div>
                    <div class="result-value">${Math.round(area)} sq ft</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Payback Period</div>
                    <div class="result-value">${paybackPeriod.toFixed(2)} years</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Coal Saved</div>
                    <div class="result-value">${coalSaved.toFixed(2)} Tons</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Equivalent Trees Planted</div>
                    <div class="result-value">${formatNumber(Math.round(treesPlanted))}</div>
                </div>
            </div>
        `;

        document.getElementById('results').innerHTML = results;
        document.getElementById('results').style.display = 'block';
        document.querySelector('.consultation-button-container').style.display = 'block';
    }

    function refreshCalculator() {
        document.getElementById('customerType').value = 'residential';
        document.getElementById('billSlider').value = 4000;
        document.getElementById('billValue').textContent = formatNumber(4000);
        document.getElementById('results').style.display = 'none';
        document.querySelector('.consultation-button-container').style.display = 'none';
        updateSliderRange();
    }

    function toggleTheme() {
        document.documentElement.classList.toggle('light-theme');
    }

    // Event Listeners
    document.getElementById('billSlider').addEventListener('input', function() {
        document.getElementById('billValue').textContent = formatNumber(this.value);
    });

    document.getElementById('checkbox').addEventListener('change', toggleTheme);
    document.getElementById('customerType').addEventListener('change', updateSliderRange);
    document.getElementById('calculateButton').addEventListener('click', calculateSolar);
    document.getElementById('refreshButton').addEventListener('click', refreshCalculator);

    // Make functions globally accessible
    window.calculateSolar = calculateSolar;
    window.refreshCalculator = refreshCalculator;
    window.updateSliderRange = updateSliderRange;

    // Initialize
    updateSliderRange();
});