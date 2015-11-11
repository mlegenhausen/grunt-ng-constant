angular.module("module1", []).constant("constant1", function() {
    var a = "v1", b = "v2";
    return {
        global_key: "global_value",
        key1: "value1",
        key2: a + "value2",
        key3: a + "value2" + b,
        key4: a + b,
        key5: b,
        key6: "value2"
    };
}()).constant("constant2", void 0).value("value1", {
    key1: "value1"
});