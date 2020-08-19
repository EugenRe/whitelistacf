const jsonConcat = require("json-concat");
const fs = require("fs");

exports.getClasses = function () {
    jsonConcat(
        {
            src: `${__dirname}/../../acf-json`,
            dest: `${__dirname}/acf-fields.json`,
        },
        function () {
            // get json data
            const acfData = require(`${__dirname}/acf-fields.json`);

            // find "choices" object function
            function findProp(obj, key, out) {
                var i,
                    proto = Object.prototype,
                    ts = proto.toString,
                    hasOwn = proto.hasOwnProperty.bind(obj);

                if ("[object Array]" !== ts.call(out)) out = [];

                for (i in obj) {
                    if (hasOwn(i)) {
                        if (i === key) {
                            out.push(obj[i]);
                        } else if (
                            "[object Array]" === ts.call(obj[i]) ||
                            "[object Object]" === ts.call(obj[i])
                        ) {
                            findProp(obj[i], key, out);
                        }
                    }
                }
                return out;
            }

            // find "choices" objects
            const choices = findProp(acfData, "choices");
            const choicesValues = [];

            // push all objects in arrays
            for (let objClasses in choices) {
                choicesValues.push(Object.keys(choices[objClasses]));
            }

            // flatten the arrays into one array function
            Object.defineProperty(Array.prototype, "flat", {
                value: function (depth = 1) {
                    return this.reduce(function (flat, toFlatten) {
                        return flat.concat(
                            Array.isArray(toFlatten) && depth > 1
                                ? toFlatten.flat(depth - 1)
                                : toFlatten
                        );
                    }, []);
                },
            });

            // flatten the arrays into one array
            const flatChoicesValues = choicesValues.flat();

            // delete all dublicates
            const valuesNoDouble = flatChoicesValues.filter(
                (item, index) => flatChoicesValues.indexOf(item) === index
            );


            // mkdir if not exist
            var dir = `${__dirname}/../../build`;

            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }

            // create file and push Array
            fs.writeFile(
                `${__dirname}/../../build/whitelistacf.json`,
                JSON.stringify(valuesNoDouble),
                function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("ACF Classes are exported and saved in build folder!");
                }
            );
        }
    );
};
