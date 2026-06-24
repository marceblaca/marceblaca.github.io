function formatoUSD(numero){
    return numero.toLocaleString("en-US",{
        style:"currency",
        currency:"USD"
    });
}

function formatoCRC(numero){
    return "₡" + numero.toLocaleString("es-CR");
}

function calcular(){

    const vehiculo =
        parseFloat(document.getElementById("vehiculo").value) || 0;

    const tc =
        parseFloat(document.getElementById("tipoCambio").value) || 500;

    const flete = 1375;
    const seguro = 100;

    const grua = 300;
    const agencia = 300;
    const inscripcion = 87;
    const dekra = 22;
    const otros = 435;

    const base =
        vehiculo +
        flete +
        seguro;

    const impuestos =
        base * 0.65;

    const total =
        base +
        impuestos +
        grua +
        agencia +
        inscripcion +
        dekra +
        otros;

    document.getElementById("base").innerText =
        formatoUSD(base);

    document.getElementById("impuestos").innerText =
        formatoUSD(impuestos);

    document.getElementById("totalUSD").innerText =
        formatoUSD(total);

    document.getElementById("totalCRC").innerText =
        formatoCRC(total * tc);
}
