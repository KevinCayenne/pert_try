export default {
    init(){
        console.log('OK');
    },

    jsonToList(list){
        var tempList = {};
        for(var i in list){
            // console.log(list[i]);
            if(!(list[i].from in tempList)){
                tempList[list[i].from] = [list[i].to];
            }else{
                tempList[list[i].from].push(list[i].to);
            }
        }
        return(tempList);
    },

    objArr2ArrArr(arr){
        let tempArr = [];
        for(let i in arr){
            tempArr.push([String(arr[i].from), String(arr[i].to)]);
        }
        return tempArr;
    }
}