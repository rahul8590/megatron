function Froobler() {
    this.name = "I am a froobler";
    this.frooble = function () { return "frooble frooble"; }
}

var froob = new Froobler();
console.log(froob.frooble());

