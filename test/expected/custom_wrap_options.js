define(["angular", "ngResource", "ngCookies"], function() {
return angular.module('module2', ['test'])

.constant('constant1', {global_key:'global_value',key1:123,key2:'value2',foobar:false})

;

});