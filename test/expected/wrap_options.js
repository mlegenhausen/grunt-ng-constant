!function(a, b) {
    "use strict";
    a.module("module2", [ "test" ]).constant("constant1", {
        global_key: "global_value",
        key1: 123,
        key2: "value2",
        foobar: !1
    });
}(angular);