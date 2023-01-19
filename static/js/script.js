var currentFile = undefined;

const setupDragAndDrop = () => {
const div1 = document.getElementsByClassName("div1")[0];
    div1.addEventListener("click", () => {
        const inputs = document.getElementsByTagName("input");
        if(inputs.length) {
            for(let input of inputs) {
                if(input.type == "file") {
                    document.removeChild(input);
                    break;
                }
            }
        }

        const input = document.createElement("input");
        input.type = "file";
        input.click();
        input.addEventListener("change", (event) => {
            currentFile = event.target.files[0];
            const textSpan = document.getElementsByTagName("span")[0];
            textSpan.innerHTML = "<< SELECTED FILE: " + currentFile.name.toUpperCase() + " >>";
        });
    });

    div1.addEventListener("dragover", (event) => {
        event.preventDefault();
        event.stopPropagation();
    }, false);

    div1.addEventListener("drop", (event) => {
        const files = event.target.files || event.dataTransfer.files;

        event.preventDefault();

        if(files && files.length)
            if(files[0].type === "image/png") {
                const textSpan = document.getElementsByTagName("span")[0];
                textSpan.innerHTML = "<< SELECTED FILE: " + files[0].name.toUpperCase() + " >>";

                currentFile = files[0];
                console.log(currentFile);
            }
            else {
                alert("Please drop a PNG!");
            }
    }, false);
};

const setupChangeColors = () => {
    const pensulitza = document.getElementsByClassName("pensulitza")[0];
    const dropDown = document.getElementsByClassName("theme")[0];

    pensulitza.addEventListener("click", (event) => {
        event.stopPropagation();

        if(dropDown.style.display == "block") {
            dropDown.style.display = "none";
        }
        else {
            dropDown.style.display = "block";
        }
    });

    const body = document.getElementsByTagName("body")[0];
    body.addEventListener("click", () => {
         if(dropDown.style.display == "block") {
            dropDown.style.display = "none";
        }
    });
};

const sendColors = (colors) => {
    fetch("/colors", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(colors)
    });
};

const onChange1 = (event) => {
    const newColor = event.target.value;
    event.target.style.backgroundColor = newColor;

    const navbar = document.getElementsByClassName("navbar")[0];
    navbar.style.backgroundColor = newColor;

    const buttons = document.getElementsByClassName("but");
    buttons[0].style.backgroundColor = newColor;

    console.log(buttons, "cdfs");
    if(buttons.length >= 2) {
        buttons[1].style.backgroundColor = newColor;
    }

    const colors = new Object();
    colors.primaryBackground = newColor;
    sendColors(colors);
};

const onChange2 = (event) => {
    const newColor = event.target.value;
    event.target.style.backgroundColor = newColor;

    const body = document.getElementsByTagName("body")[0];
    body.style.backgroundColor = newColor;

    const colors = new Object();
    colors.secondaryBackground = newColor;
    sendColors(colors);
};

const onChange3 = (event) => {
    const newColor = event.target.value;
    event.target.style.backgroundColor = newColor;

    const title = document.getElementsByTagName("h1")[0];
    title.style.color = newColor;

    const pensulitza = document.getElementsByClassName("pensulitza")[0];
    pensulitza.childNodes[1].style.color = newColor;

    const div1 = document.getElementsByClassName("div1")[0];
    div1.style.borderColor = newColor;

    const span = document.getElementsByTagName("span")[0];
    if(span) {
        span.style.color = newColor;
    }

    const buttons = document.getElementsByClassName("but");
    buttons[0].style.color = newColor;

    if(buttons.length >= 2) {
        buttons[1].style.color = newColor;
    }

    const footer = document.getElementsByTagName("footer")[0];
    footer.childNodes[1].style.color = newColor;
    footer.childNodes[1].childNodes[1].style.color = newColor;

    const colors = new Object();
    colors.foregroundColor = newColor;
    sendColors(colors);
};

const setColors = (colors) => {
    const inputs = document.getElementsByTagName("input");

    const event = new Object();
    event.target = inputs[0];
    event.target.value = colors.primaryBackground;
    onChange1(event);

    event.target = inputs[1];
    event.target.value = colors.secondaryBackground;
    onChange2(event);

    event.target = inputs[2];
    event.target.value = colors.foregroundColor;
    onChange3(event);
};

const setupDropDownItems = () => {
    const dropDownElements = document.getElementsByClassName("colors");
    const inputs = document.getElementsByTagName("input");
    console.log(dropDownElements);

    for(let index = 0; index < dropDownElements.length; index++) {
        const element = dropDownElements[index];
        const input = inputs[index];

        console.log(input, inputs);
        if(index == 0) {
            input.addEventListener("change", onChange1);
        }

        if(index == 1) {
            input.addEventListener("change", onChange2);
        }

        if(index == 2) {
            input.addEventListener("change", onChange3);
        }

        element.addEventListener("click", () => {
            input.click();
        })
    }
};

const addButtonsClickListener = () => {
    const buttons = document.getElementsByClassName("but");

    if(buttons.length >= 2) {
        console.log("fsdsdsf");
        buttons[0].addEventListener("click", () => {
            if(!currentFile) {
                alert("Please input a png image!");
                return;
            }

            alert("Please wait until image is generated. You will be automatically redirected to it.");

            const data = new FormData();
            data.append("file", currentFile);
            data.append("pixelart", true);

            fetch('/generate_image', {
              method: 'POST',
              body: data
            }).then(r => r.text()).then(t => window.location.href = "/generated_image/" + t)
        });

        buttons[1].addEventListener("click", () => {
            if(!currentFile) {
                alert("Please input a png image!");
                return;
            }

            alert("Please wait until image is generated. You will be automatically redirected to it.");

            const data = new FormData();
            data.append("file", currentFile);
            data.append("original", true);

            fetch('/generate_image', {
              method: 'POST',
              body: data
            }).then(r => r.text()).then(t => window.location.href = "/generated_image/" + t)
        });
    }
    else {
        buttons[0].addEventListener("click", () => {
            const a = document.createElement("a");
            const img = document.getElementsByTagName("img");
            if(!img.length) {
                alert("Cannot download image.");
                return;
            }

            console.log(img[0].src);
            a.href = img[0].src;
            a.download = "";
            a.click();
        });
    }
}

window.onload = () => {
    const main_link = location.protocol + '//' + location.host + "/";
    console.log(main_link, window.location.href);
    if(main_link == window.location.href) {
        setupDragAndDrop();
    }

    setupChangeColors();
    setupDropDownItems();
    addButtonsClickListener();
}