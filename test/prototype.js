var __extends = function(n) { return n;}

var SimpleReference=function(){function SimpleReference(constant_pool,value){this.constant_pool=constant_pool,this.value=value}return SimpleReference.from_bytes=function(bytes_array,constant_pool){var value=bytes_array.get_uint(2);return new this(constant_pool,value)},SimpleReference.prototype.deref=function(){var pool_obj=this.constant_pool[this.value];return(typeof pool_obj.deref=="function"?pool_obj.deref():void 0)||pool_obj.value},SimpleReference.size=1,SimpleReference}();

var ClassReference = function(_super) {
    function ClassReference(){ 
	_super.apply(this,arguments), this.type="class"
    }
    return __extends(ClassReference,_super),ClassReference.prototype.deref=function(){
	var pool_obj=this.constant_pool[this.value];
	return typeof pool_obj.deref=="function"?pool_obj.deref():util.typestr2descriptor(pool_obj.value)
    },ClassReference}(SimpleReference);

