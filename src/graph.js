export default {

    paths({ graph = [], from, to }, path = []) {
        const linkedNodes = memoize(nodes.bind(null, graph));
        return explore(from, to);
    
        function explore(currNode, to, paths = []) {
            path.push(currNode);
            // console.log(path);
            for (let linkedNode of linkedNodes(currNode)) {

                if (linkedNode === to) {
                    let result = path.slice(); // copy values
                    result.push(to);
                    paths.push(result);
                    continue;
                }
                // do not re-explore edges
                if (!hasEdgeBeenFollowedInPath({
                        edge: {
                            from: currNode,
                            to: linkedNode
                        },
                        path
                    })) {                    
                    explore(linkedNode, to, paths);
                }
            }
            path.pop(); // sub-graph fully explored            
            return paths;
        }

        /** 
         * Get all nodes linked 
         * to from `node`.
         */
        function nodes(graph, node) {
            return graph.reduce((p, c) => {
                (c[0] === node) && p.push(c[1]);
                return p;
            }, []);
        }

        /**
         * Has an edge been followed 
         * in the given path?
         */
        function hasEdgeBeenFollowedInPath({ edge, path }) {
            var indices = allIndices(path, edge.from);
            return indices.some(i => path[i + 1] === edge.to);
        }

        /**
        * Utility to get all indices of 
        * values matching `val` in `arr`.
        */
        function allIndices(arr, val) {
            var indices = [],
                i;
            for (i = 0; i < arr.length; i++) {
                if (arr[i] === val) {
                    indices.push(i);
                }
            }
            return indices;
        }

        /**
         * Avoids recalculating linked 
         * nodes.
         */
        function memoize(fn) {
            const cache = new Map();
            return function() {
                var key = JSON.stringify(arguments);
                var cached = cache.get(key);
                if (cached) {
                    return cached;
                }
                cached = fn.apply(this, arguments)
                cache.set(key, cached);
                return cached;
            };
        }
    },

    addCriticalPath(data, path){
        let lengthArr = []; // critical path arr

        // find critical path
        for(let i in path){
            // console.log(data);
            let lengthSum = 0;
            for(let k in path[i]){
                let num = String(parseInt(path[i][k]) - 1);
                lengthSum += data[num].length;
            } 
            lengthArr.push(lengthSum);
        }
        let maxLength = Math.max.apply(null, lengthArr);
        let pathArr = getAllIndexes(lengthArr, maxLength);

         // update critical path and early start
        for(let p in pathArr){
            let criticalPath = path[pathArr[p]];
            for(let i in data){
                if(criticalPath.includes(String(data[i].key))){
                    var preNode = Object(data[preItem]);
                    data[i].critical = true;
                    if(i == 0){
                        data[i].earlyStart = 0;
                        data[i].earlyFinish = data[i].length + data[i].earlyStart;
                    }else if(i != 0){
                        data[i].earlyStart = preNode.length + preNode.earlyStart;
                        data[i].earlyFinish = data[i].length + data[i].earlyStart;
                    }
                    data[i].lateFinish = data[i].length + data[i].earlyStart;
                    data[i].lateStart = data[i].lateFinish - data[i].length;
                    var preItem = i;
                }
            }
        }
        return data;

        function getAllIndexes(arr, val) {
            var indexes = [], i = -1;
            while ((i = arr.indexOf(val, i+1)) != -1){
                indexes.push(i);
            }
            return indexes;
        }
    },

    fillRestItem(data, link){
        // calculate ES EF
        for(let i in data){
            if(!data[i].critical){
                let tempPreArr = [];
                for(let l in link){
                    if(link[l][1] == data[i].key){
                        tempPreArr.push(link[l][0]); 
                    }
                }
                let tempEarlyStartArr = [];
                for(let a in tempPreArr){
                    if(data[String(tempPreArr[a]-1)].key){
                        tempEarlyStartArr.push(data[String(tempPreArr[a]-1)].earlyFinish);
                    }
                }
                data[i].earlyStart = Math.max.apply(null, tempEarlyStartArr);
                data[i].earlyFinish = data[i].length + data[i].earlyStart;
            }   
        }
        
        var revData = [...data].reverse();

        // calculate LS LF
        for(let rei in revData){
            if(!revData[rei].critical){
                let tempAfterArr = [];
                for(let l in link){
                    if(link[l][0] == revData[rei].key){
                        tempAfterArr.push(link[l][1]); 
                    }
                }
                // console.log(tempAfterArr);
                let tempLateStartArr = [];
                for(let a in tempAfterArr){
                    if(data[String(tempAfterArr[a]-1)].key){
                        // console.log(data.reverse()[String(tempAfterArr[a]-1)].key);
                        tempLateStartArr.push(data[String(tempAfterArr[a]-1)].lateStart);
                    }
                }
                // console.log(tempLateStartArr);
                revData[rei].lateFinish = Math.min.apply(null, tempLateStartArr);
                revData[rei].lateStart = revData[rei].lateFinish - revData[rei].length;
            }
        }
    },

    nodeAdd(data, linkArr, link, num = '', text, length){
        if(num == ''){
            num = data.length + 1;
        }
        Object.keys(data).forEach(function(key){
            if(data[key].key >= num){
                data[key].key = data[key].key + 1
            } 
        });
        // console.log(linkArr);
        linkArr.forEach(l =>{
            if(l.from >= num){
                l.from = l.from + 1;
            }
            if(l.to >= num){
                l.to = l.to + 1;
            }
        });
        link.forEach(l =>{
            if(parseInt(l[0]) >= num){
                l[0] = String(parseInt(l[0]) + 1);
            }
            if(parseInt(l[1]) >= num){
                l[1] = String(parseInt(l[1]) + 1);
            }
        });
        data.splice(num-1, 0, 
            { key: num, text: text, length: length, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: false, preLink: [], toLink: [], position: 'none'},
        );
    },

    nodeDelete(data, linkArr, link, num){
        // console.log(linkArr);
        data.splice(num-1, 1);
        for(let l in linkArr){
            if(linkArr[l].from == num || linkArr[l].to == num){
                linkArr.splice(l, 1);
            }
        }
        for(let l in link){
            if(link[l][0] == num || link[l][1] == num){
                link.splice(l, 1);
            }
        }
        Object.keys(data).forEach(function(key){
            if(data[key].key >= num){
                data[key].key = data[key].key - 1;
            } 
        });
        linkArr.forEach(l =>{
            if(l.from > num){
                l.from = l.from - 1;
            }
            if(l.to > num){
                l.to = l.to - 1;
            }
        });
        link.forEach(l =>{
            if(parseInt(l[0]) > num){
                l[0] = String(parseInt(l[0]) - 1);
            }
            if(parseInt(l[1]) > num){
                l[1] = String(parseInt(l[1]) - 1);
            }
        });
        
    },

    linkAdd(linkArr, link, from, to, mode, lag){
        linkArr.push(
            { from: from, to: to, mode: mode, lag: lag}
        );
        link.push(
            [String(from), String(to), mode, String(lag)]
        );
    },

    linkDelete(linkArr, link, from, to){
        for(let l in linkArr){
            if(linkArr[l].from == from && linkArr[l].to == to){
                linkArr.splice(l, 1);
            }
        }
        for(let l in link){
            if(link[l][0] == from && link[l][1] == to){
                link.splice(l, 1);
            }
        }
    },

    isLinked(data, link){
        data.forEach(element => {
            // console.log(element);
            link.forEach(l =>{
                // console.log(l);
                if(l[1] == element.key){
                    element.preLink.push(l[0]);
                }else if(l[0] == element.key){
                    element.toLink.push(l[1]);
                }
            });
        });
    },
    
    adjustStartandEnd(data, link, linkArr){
        data.splice(0, 0, 
            { key: 0, text: "Start", length: 0, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: true, preLink: [], toLink: [], position: 'S'},
            );
        var last = data.length;
        data.push(
            { key: last, text: "Finish", length: 0, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, critical: true, preLink: [], toLink: [], position: 'F'},
        );
        data.forEach(element => {
            if(element.preLink.length == 0 && element.toLink.length == 0 && (element.text != 'Finish' && element.text != 'Start')){
                element.position = 'none';
            }else if(element.preLink.length > 0 && element.toLink.length > 0){
                element.position = 'middle';
            }else if(element.preLink.length == 0 && element.toLink.length > 0){
                element.position = 'start';
                link.splice(0, 0, ["0", String(element.key), "FS", "0"]);
                linkArr.splice(0, 0, { from: 0, to: element.key, mode: 'FS', lag: 0});
            }else if(element.preLink.length > 0 && element.toLink.length == 0){
                element.position = 'finish';
                link.push([String(element.key), String(last), "FS", "0"]);
                linkArr.push({ from: element.key, to: last, mode: 'FS', lag: 0});
            }
        });
        if(data.length == 3){
            data[1].position = 'startFinish';
            link.splice(0, 0, ["0", String(data[1].key), "FS", "0"]);
            linkArr.splice(0, 0, { from: 0, to: data[1].key, mode: 'FS', lag: 0});

            link.push([String(data[1].key), String(last), "FS", "0"]);
            linkArr.push({ from: data[1].key, to: last, mode: 'FS', lag: 0});
        }else if(data.length == 2){
            link.push(["0", String(last), "FS", "0"]);
            linkArr.push({ from: 0, to: last, mode: 'FS', lag: 0});
        }
        // console.log(link);
    },

    fillEarlyItem(data, link){
        // console.log(data.length);
        if(data.length > 2){
            var ConsArr = [];
            data.forEach(e => {
                if(e.position == 'start'){
                    e.earlyFinish = e.length;
                }else if(e.position == 'middle'){
                    let counter = 1;
                    link.forEach(l => {
                        if(e.key == l[1]){
                            let mode = l[2];
                            let preSpot = data[l[0]];
                            modeSwitch(mode, preSpot, e, ConsArr, counter);
                            counter++;
                        }
                    });
                    // console.log(ConsArr);
                }else if(e.position == 'finish'){
                    let counter = 1;
                    link.forEach(l => {
                        if(e.key == l[1]){
                            let mode = l[2];
                            let preSpot = data[l[0]];
                            modeSwitch(mode, preSpot, e, ConsArr, counter);
                            counter++;
                        }
                    });
                    // console.log(ConsArr);
                }else if(e.position == 'S'){
    
                }else if(e.position == 'F'){
                    let counter = 1;
                    link.forEach(l => {
                        if(e.key == l[1]){
                            let mode = l[2];
                            let preSpot = data[l[0]];
                            modeSwitch(mode, preSpot, e, ConsArr, counter);
                            counter++;
                        }
                    });
                }else if(e.position == 'none'){
                }
            });
        }
        console.log(ConsArr);
        // for(let i in data){
        //     if(data[i].key == 0){
        //         data[i].earlyFinish = data[i].length;
        //     }else if(data[i].link == true){
        //         var ConsArr = [];
        //         let counter = 1;
        //         for(let l in link){
        //             if(link[l][1] == data[i].key){
        //                 let preSpot = data[link[l][0]-1];
        //                 let thisSpot = data[i];
        //                 let mode = link[l][2];
        //                 modeSwitch(mode, preSpot, thisSpot, ConsArr, counter);
        //                 counter++;
        //             }
        //         }
        //         // console.log(ConsArr);
        //         for(let cons in ConsArr){
        //             if(!(ConsArr[cons][1] >= ConsArr[cons][0])){
        //                 console.log(ConsArr[cons]);
        //                 let preSpot = data[ConsArr[cons][4]-1];
        //                 let thisSpot = data[ConsArr[cons][5]-1];
        //                 let mode = ConsArr[cons][2];
        //                 if(mode == 'FF'){
        //                     thisSpot.earlyFinish = preSpot.earlyFinish; 
        //                     thisSpot.earlyStart = thisSpot.earlyFinish - thisSpot.length;
        //                 }else if(mode == 'SS'){
        //                     thisSpot.earlyStart = preSpot.earlyStart; 
        //                     thisSpot.earlyFinish = thisSpot.earlyStart + thisSpot.length;
        //                 }else if(mode == 'SF'){
        //                     preSpot.earlyStart = thisSpot.earlyFinish;
        //                     thisSpot.earlyStart = thisSpot.earlyFinish - thisSpot.length;
        //                 }
        //             }
        //         }
        //     }
        // }

        let errArr = [];
        for(let i in data){
            if(data[i].earlyStart == 0 && i != 0 && (data[i].position == 'middle' || data[i].position == 'finish')){
                errArr.push(data[i]);
            }
        }

        for(let con in ConsArr){
            if(ConsArr[con][0] == 0 || ConsArr[con][1] == 0){
                errArr.push(ConsArr[con]);
            }
        }

        // console.log(errArr);
        if(errArr.length == 0){
            return 1;
        }else{
            this.fillEarlyItem(data, link);
        }

        function modeSwitch(mode, from, to, Arr, num){
            var innerConsArr = [];
            switch(mode){
                case 'FS': 
                    if(to.earlyStart < from.earlyFinish){
                        to.earlyStart = from.earlyFinish;
                        to.earlyFinish = to.earlyStart + to.length;
                    }
                    innerConsArr.push(from.earlyFinish, to.earlyStart, mode, num, from.key, to.key);
                    break;
                case 'FF':
                    if(to.earlyFinish < from.earlyFinish){
                        to.earlyFinish = from.earlyFinish;
                        to.earlyStart = to.earlyFinish - to.length;
                    }
                    innerConsArr.push(from.earlyFinish, to.earlyFinish, mode, num, from.key, to.key);
                    break;
                case 'SF':
                    if(to.earlyStart < from.earlyFinish){
                        to.earlyStart = from.earlyFinish;
                        to.earlyFinish = to.earlyStart + to.length;
                    }
                    innerConsArr.push(from.earlyStart, to.earlyFinish, mode, num, from.key, to.key);
                    break;
                case 'SS': 
                    if(to.earlyStart < from.earlyStart){
                        to.earlyStart = from.earlyStart;
                        to.earlyStart = to.earlyFinish - to.length;
                    }
                    to.earlyFinish = to.earlyStart + to.length;
                    innerConsArr.push(from.earlyStart, to.earlyStart, mode, num, from.key, to.key);    
                    break;
            }
            Arr.push(innerConsArr);
        }
    },

    fillLateItem(data, link){
        var originData = data;
        var revdata = [...data].reverse();
        var toConsArr = [];
        let counter = 1;

        // console.log(revdata.length);
        if(revdata.length > 2){
            revdata.forEach(e => {
                // console.log(e);
                if(e.position == 'start'){
                    e.lateFinish = e.lateStart + e.length;
                }else if(e.position == 'middle'){
                    link.forEach(l => {
                        if(e.key == l[0]){
                            let mode = l[2];
                            let toSpot = originData[l[1]];
                            toModeSwitch(mode, e, toSpot, toConsArr, counter);
                            counter++;
                        }
                    });
                }else if(e.position == 'finish'){
                    link.forEach(l => {
                        if(e.key == l[0]){
                            let mode = l[2];
                            let toSpot = originData[l[1]];
                            toModeSwitch(mode, e, toSpot, toConsArr, counter);
                            counter++;
                        }
                    });
                }else if(e.position == 'S'){
    
                }else if(e.position == 'F'){
                    e.lateFinish = e.earlyFinish;
                    e.lateStart = e.earlyStart;
                }else if(e.position == 'none'){
                }
            });

            let errArr = [];
            for(let cons in toConsArr){
                if(toConsArr[cons][0] == 0 || toConsArr[cons][1] == 0){
                    errArr.push(toConsArr[cons]);
                }
            }
            // console.log(errArr);
            if(errArr.length == 0){
                return 1;
            }else{
                this.fillLateItem(data, link);
            }
        }
        // console.log(originData, revdata);
        // for(let i in revdata){
        //     if(i == 0){
        //         revdata[i].lateFinish = revdata[i].earlyFinish;
        //         revdata[i].lateStart = revdata[i].earlyStart;
        //     }
        //     if(revdata[i].link == true){
        //         // console.log(revdata[i].key);
        //         var toConsArr = [];
        //         let counter = 1;
        //         for(let l in link){
        //             if(link[l][0] == revdata[i].key){
        //                 let thisSpot = revdata[i];
        //                 let toSpot = originData[link[l][1]-1];
        //                 let mode = link[l][2];
        //                 // console.log(link[l], toSpot, mode);
        //                 toModeSwitch(mode, thisSpot, toSpot, toConsArr, counter);
        //                 counter++;
        //             }
        //         }
        //         // console.log(toConsArr);
        //         for(let cons in toConsArr){
        //             if(!(toConsArr[cons][1] >= toConsArr[cons][0])){
        //                 // console.log(toConsArr[cons]);
        //             }
        //         }
        //     }
        // }

        function toModeSwitch(mode, from, to, Arr, num){
            var innerConsArr = [];
            switch(mode){
                case 'FS': 
                    if(from.lateFinish <= 0 || (from.lateFinish > 0 && from.lateFinish > to.lateStart)){
                        from.lateFinish = to.lateStart;
                    }
                    // from.lateFinish = to.lateStart;
                    if(from.lateFinish != 0){
                        from.lateStart = from.lateFinish - from.length;
                    }
                    innerConsArr.push(from.lateFinish, to.lateStart, mode, num, from.key, to.key);
                    break;
                case 'FF':
                    if(from.lateFinish <= 0 || from.lateFinish > to.lateFinish){
                        from.lateFinish = to.lateFinish;
                    }
                    if(from.lateFinish != 0){
                        from.lateStart = from.lateFinish - from.length;
                    }
                    innerConsArr.push(from.lateFinish, to.lateFinish, mode, num, from.key, to.key);
                    break;
                case 'SF':
                    if(from.lateStart <= 0 || from.lateStart > to.lateFinish){
                        from.lateStart = to.lateFinish;
                    }
                    if(from.lateStart != 0){
                        from.lateFinish = from.lateStart + from.length;
                    }
                    innerConsArr.push(from.lateStart, to.lateFinish, mode, num, from.key, to.key);
                    break;
                case 'SS': 
                    if(from.lateStart <= 0 || from.lateStart > to.lateStart){
                        from.lateStart = to.lateStart;
                    }
                    if(from.lateStart != 0){
                        from.lateFinish = from.lateStart + from.length;
                    }
                    innerConsArr.push(from.lateStart, to.lateStart, mode, num, from.key, to.key);    
                    break;
            }
            Arr.push(innerConsArr);
        }
    },

    addCriticalPathNew(data, path){
        for(let i in data){
            if(data[i].lateFinish == data[i].earlyFinish && data[i].position != 'none'){
                data[i].critical = true;
            }
        }
        // console.log(data);
    }
}