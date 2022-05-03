export function copyStringToClipboard(str) {
    console.log(str);
    document.activeElement.blur();
    if (!str) return;
    var el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style = { position: "absolute", left: "-9999px" };
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
}

export function redirect(url) {
    console.log("changing screen");
    document.activeElement.blur();
    if (!url) return;
    var a = document.createElement("a");
    a.setAttribute("readonly", "");
    a.style = { position: "absolute", left: "-9999px" };
    a.target = "_blank";
    a.rel = "noreferrer";
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

