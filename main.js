const recipientListEl = document.getElementById("recipients");
const noRecipientEl = document.getElementById("no-recipient");
const getRecipientCount = () =>
	Array.from(recipientListEl.children).filter(
		(element) => element instanceof HTMLLIElement
	).length;

async function importRecipients() {
	if (getRecipientCount() > 0 && !confirm("Override exsisting recipients?"))
		return;

	let text = await navigator.clipboard.readText();

	let recipients;
	if (text.includes(",")) {
		recipients = text.split(",");
	} else if (text.includes("\n")) {
		recipients = text.split("\n");
	} else {
		alert(
			"Cannot read recipients from clipboard. Please try using ',' to seperate recipients."
		);
		return;
	}

	Array.from(recipientListEl.children).forEach((child) => {
		if (child instanceof HTMLLIElement) child.remove();
	});

	recipients.forEach((name, i) => {
		const li = document.createElement("li");
		li.innerText = name + " ";

		const delBtn = document.createElement("button");
		delBtn.innerHTML = "Delete";
		delBtn.onclick = () => {
			li.remove();
			if (getRecipientCount() == 0) {
				noRecipientEl.style.display = "block";
			}
		};
		li.appendChild(delBtn);

		recipientListEl.appendChild(li);
	});
	noRecipientEl.style.display = "none";
}

// const el = document.createElement("input");
// el.type = "file";

// el.style.display = "none";
// document.body.appendChild(el);
// el.click();

// let file = await new Promise((resolve) => {
// 	el.onchange = (e) => {
// 		resolve(e.target.files[0]);
// 	};
// });

// document.body.removeChild(el);

// if (file == undefined) return;

// let reader = new FileReader();
// reader.readAsText(file);

// /** @type {string} */
// let text = await new Promise((resolve) => {
// 	reader.onload = (e) => {
// 		resolve(e.target.result);
// 	};
// });

function addRecipient() {
	let name = prompt("Name:");

	const li = document.createElement("li");
	li.innerText = name + " ";

	const delBtn = document.createElement("button");
	delBtn.innerHTML = "Delete";
	delBtn.onclick = () => {
		li.remove();
		if (getRecipientCount() == 0) {
			noRecipientEl.style.display = "block";
		}
	};
	li.appendChild(delBtn);

	recipientListEl.appendChild(li);
	noRecipientEl.style.display = "none";
}

async function printCards() {
	let template = (
		await fetch(document.getElementById("template-select").value).then((r) =>
			r.text()
		)
	).replace("{NAME}", document.getElementById("name").value);
	let html = "";

	Array.from(recipientListEl.children)
		.filter((element) => element instanceof HTMLLIElement)
		.map((e) => e.innerHTML.split("<")[0])
		.forEach((name) => {
			html += `<div class="card-inside">${markdown(
				template.replace("{RECIPIENT}", name)
			)}</div>`;
		});

	document.getElementById("print").innerHTML = html;
	print();
}
