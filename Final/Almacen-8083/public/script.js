function validateForm() {
  var name = document.getElementById("name").value;
  var category = document.getElementById("category").value;
  var amount = document.getElementById("amount").value;
  var cost = document.getElementById("cost").value;

  if (name == "") {
    alert("Name must be filled out");
    return false;
  }
  
  if (category == "") {
    alert("Category must be filled out");
    return false;
  }
  if (amount == "") {
    alert("Amount must be filled out");
    return false;
  }
  else if (amount < 0) {
    alert("Amount must be positive");
    return false;
  }

  if (cost == "") {
     alert("Cost must be filled out");
     return false;
  }
  else if (cost < 0) {
     alert("Cost must be positive");
     return false;
    }

  return true;
}

async function showData(){
    const productList = (await fetch('http://localhost:2206/almacen').then(response => response.text())).split('\n');
    let html="";
    productList.forEach(function(product){
        product = product.split(',')
        index = product[0];
        html += "<tr>";
        html += "<td>" + (index) + "</td>";
        html += "<td>" + product[1] + "</td>";
        html += "<td>" + product[2] + "</td>";   
        html += "<td>" + product[3] + "</td>";
        html += "<td>" + product[4] + "</td>";
        //html += 
        //    '<td><button class="btn btn-danger" onclick="deleteProduct('+index+')">Delete</button><button class="btn btn-warning m-2" onclick="updateProduct('+index+')">Edit</button></td>';
        html += '<td class="d-flex align-items-center justify-content-center flex-row flex-wrap">' +
        '<button id="edit" class="btn btn-warning me-3" onclick="updateProduct(' + index + ')">Edit</button>' +
        '<button id="delete" class="btn btn-danger" onclick="deleteProduct(' + index + ')">Delete</button>' +
        '</td>';
        html += "</tr>";
    }); 
    
    document.querySelector("#crudTable tbody").innerHTML = html;

}
//Loads all data when document or page loaded
document.onload = showData();

async function AddData(){
    if(validateForm() == true){
        let name = document.getElementById("name").value;
        let category = document.getElementById("category").value;   
        let amount = document.getElementById("amount").value;   
        let cost = document.getElementById("cost").value;
        await fetch('http://localhost:2206/almacen', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: `${name},${category},${amount},${cost}`
        }).then(response => response.text())
        .then(data => {
            console.log('Success:', data);
        }
        ).catch((error) => {
            console.error('Error:', error);
        });
        showData();
        document.getElementById("name").value = "";
        document.getElementById("category").value = "";
        document.getElementById("amount").value = "";
        document.getElementById("cost").value = "";
        window.scrollTo(0, document.body.scrollHeight);
    }
}

async function deleteProduct(index){
    await fetch('http://localhost:2206/almacen/' + index, {
        method: 'DELETE'
    });
    showData();
}

async function updateProduct(index){
    document.getElementById("Submit").style.display = "none";
    document.getElementById("Update").style.display = "block";

    let product = await fetch('http://localhost:2206/almacen/' + index).then(response => response.text());
    product = product.substring(0, product.length - 2);
    product = product.split(',');
    document.getElementById("name").value = product[1];
    document.getElementById("category").value = product[2];
    document.getElementById("amount").value = product[3];    
    document.getElementById("cost").value = product[4];
    window.scrollTo(0, 0);
    document.querySelector("#Update").onclick = async function(){
        if(validateForm() == true){
            await fetch('http://localhost:2206/almacen/' + index, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: `${document.getElementById("name").value},${document.getElementById("category").value},${document.getElementById("amount").value},${document.getElementById("cost").value}`
            });

            showData();

            document.getElementById("name").value = "";
            document.getElementById("category").value = "";
            document.getElementById("amount").value = "";
            document.getElementById("cost").value = "";

            document.getElementById("Submit").style.display = "block";
            document.getElementById("Update").style.display = "none";
        }
    }
}
