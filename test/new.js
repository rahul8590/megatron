function Froobler() {
    this.name = "I am a froobler";
    this.frooble = function () { return "frooble frooble"; }
    return this;
}

var froob = new Froobler();
console.log(froob.frooble());

