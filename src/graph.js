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

    fillEarlyItem(data, link){
        for(let i in data){
            if(data[i].key == 1){
                data[i].earlyFinish = data[i].length;
            }else{
                var ConsArr = [];
                let counter = 1;
                for(let l in link){
                    if(link[l][1] == data[i].key){
                        let preSpot = data[link[l][0]-1];
                        let thisSpot = data[i];
                        let mode = link[l][2];
                        modeSwitch(mode, preSpot, thisSpot, ConsArr, counter);
                        counter++;
                    }
                }
                // console.log(ConsArr);
                for(let cons in ConsArr){
                    if(!(ConsArr[cons][1] >= ConsArr[cons][0])){
                        console.log(ConsArr[cons]);
                        let preSpot = data[ConsArr[cons][4]-1];
                        let thisSpot = data[ConsArr[cons][5]-1];
                        let mode = ConsArr[cons][2];
                        if(mode == 'FF'){
                            thisSpot.earlyFinish = preSpot.earlyFinish; 
                            thisSpot.earlyStart = thisSpot.earlyFinish - thisSpot.length;
                        }else if(mode == 'SS'){
                            thisSpot.earlyStart = preSpot.earlyStart; 
                            thisSpot.earlyFinish = thisSpot.earlyStart + thisSpot.length;
                        }else if(mode == 'SF'){
                            preSpot.earlyStart = thisSpot.earlyFinish;
                            thisSpot.earlyStart = thisSpot.earlyFinish - thisSpot.length;
                        }
                    }
                }
            }
        }

        function modeSwitch(mode, from, to, Arr, num){
            var innerConsArr = [];
            switch(mode){
                case 'FS': 
                    if(to.earlyStart < from.earlyFinish){
                        to.earlyStart = from.earlyFinish;
                    }
                    to.earlyFinish = to.earlyStart + to.length;
                    innerConsArr.push(from.earlyFinish, to.earlyStart, mode, num, from.key, to.key);
                    break;
                case 'FF':
                    to.earlyFinish = from.earlyFinish;
                    to.earlyStart = to.earlyFinish - to.length;
                    innerConsArr.push(from.earlyFinish, to.earlyFinish, mode, num, from.key, to.key);
                    break;
                case 'SF':
                    to.earlyStart = from.earlyStart;
                    to.earlyFinish = to.earlyStart + to.length;
                    innerConsArr.push(from.earlyStart, to.earlyFinish, mode, num, from.key, to.key);
                    break;
                case 'SS': 
                    to.earlyStart = from.earlyStart;
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
        // console.log(originData, revdata);
        for(let i in revdata){
            if(i == 0){
                revdata[i].lateFinish = revdata[i].earlyFinish;
                revdata[i].lateStart = revdata[i].earlyStart;
            }
            // console.log(revdata[i].key);
            var toConsArr = [];
            let counter = 1;
            for(let l in link){
                if(link[l][0] == revdata[i].key){
                    let thisSpot = revdata[i];
                    let toSpot = originData[link[l][1]-1];
                    let mode = link[l][2];
                    // console.log(link[l], toSpot, mode);
                    toModeSwitch(mode, thisSpot, toSpot, toConsArr, counter);
                    counter++;
                }
            }
            // console.log(toConsArr);
            for(let cons in toConsArr){
                if(!(toConsArr[cons][1] >= toConsArr[cons][0])){
                    // console.log(toConsArr[cons]);
                }
            }
        }

        function toModeSwitch(mode, from, to, Arr, num){
            var innerConsArr = [];
            switch(mode){
                case 'FS': 
                    from.lateFinish = to.lateStart;
                    from.lateStart = from.lateFinish - from.length;
                    innerConsArr.push(from.lateFinish, to.lateStart, mode, num, from.key, to.key);
                    break;
                case 'FF':
                    from.lateFinish = to.lateFinish;
                    from.lateStart = from.lateFinish - from.length;
                    innerConsArr.push(from.lateFinish, to.lateFinish, mode, num, from.key, to.key);
                    break;
                case 'SF':
                    from.lateStart = to.lateFinish;
                    from.lateFinish = from.lateStart + to.length;
                    innerConsArr.push(from.lateStart, to.lateFinish, mode, num, from.key, to.key);
                    break;
                case 'SS': 
                    from.lateStart = to.lateStart;
                    from.lateFinish = from.lateStart + to.length;
                    innerConsArr.push(from.lateStart, to.lateStart, mode, num, from.key, to.key);    
                    break;
            }
            Arr.push(innerConsArr);
        }
    },

    addCriticalPathNew(data){
        for(let i in data){
            if(data[i].lateFinish == data[i].earlyFinish){
                data[i].critical = true;
            }
        }
        console.log(data);
    }
}