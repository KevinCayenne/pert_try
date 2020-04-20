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
    }
}