
//budget controller
var budgetController = (function(){
   var Expense = function(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
   };

   var Income = function(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
   };

   var calculateTotal = function(type){
      var sum = 0;
      data.allItems[type].forEach(function(cur){
         sum += cur.value;
      });
      data.totals[type] = sum;
   }
   
   var data = {
      allItems:{
         exp:[],
         inc:[]
      },
      totals:{
         exp:0,
         inc:0
      },
      budget: 0,
      percentage: -1
   

   };

   return {
      addItem: function(type, des, val){
         var newItem, ID;
         //[1 2 3 6 8] new id = 9
         // ID = last id + 1
         //Create new ID
         if(data.allItems[type].length > 0){
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
         } else{
            ID = 0;
         }
         
         //Create new item based on inc or exp type
         if(type === 'exp'){
            newItem = new Expense(ID, des, val);
         } else if(type === 'inc'){
            newItem = new Income(ID, des, val);
         }
         //Push it into our data structure
         data.allItems[type].push(newItem);
         //Return the new element
         return newItem;
         
      },

      deleteItem: function(type, id){
         var ids, index;
         ids = data.allItems[type].map(function(current){
            return current.id;
         });
         index = ids.indexOf(id);

         if(index !== -1){
            data.allItems[type].splice(index, 1);
         }

      },

      calculateBudget: function(){
         // Calculate total income and expenses
         calculateTotal('exp');
         calculateTotal('inc');
         // Calculate the budget: income - expenses
         data.budget = data.totals.inc - data.totals.exp;
         
         // Calculate the percentage of income that was spent
         if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
         }else {
            data.percentage = -1;
         }
         
      },
      getBudget: function(){
         return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
         }
      },

      testing: function(){
         console.log(data);
      }

   };


})();

//ui controller
var UIController = (function(){
   DOMstrings = {
      inputType: '.add__type',
      inputDescription: '.add__description',
      inputValue: '.add__value',
      inputButton: '.add__btn',
      incomeContainer: '.income__list',
      expensesContainer: '.expenses__list',
      budgetLabel: '.budget__value',
      incomeLabel: '.budget__income--value',
      expensesLabel: '.budget__expenses--value',
      percentageLabel: '.budget__expenses--percentage',
      container: '.container'

   };
    return {
      getInput: function(){
         return{
            type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            
         };
         
        
      },
      addListItem: function(obj, type){
         var html, newHtml, element;
            // Create html string with placeholder text
            if(type === 'inc'){
               element = DOMstrings.incomeContainer;

               html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value"> %value% </div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            }else if(type === 'exp'){
               element = DOMstrings.expensesContainer;

               html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div></div>'

            }
            
            //Replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);


            //insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
      },
      deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
      },

      clearFields: function(){
         var fields, fieldsArr;
         fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

         var fieldsArr = Array.prototype.slice.call(fields);

         fieldsArr.forEach(function(current, index, array){
            current.value = "";
         });

         fieldsArr[0].focus();
      },

      displayBudget: function(obj){
         document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
         document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
         document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
         

         if(obj.percentage > 0){
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
         }else{
            document.querySelector(DOMstrings.percentageLabel).textContent = '---';

         }
      },

      getDOMstrings:function(){
         return DOMstrings;
      }
    };
})();

//Global app controller
var controller = (function(budgetCtrl, UICtrl){
   var setUpEventListeners = function(){
      var DOM = UICtrl.getDOMstrings();
      
      document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
      
      document.addEventListener('keypress', function(event){
         if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
         }
      });

      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

   };
   
   var updateBudget = function(){
      //1. calculate the budget
      budgetCtrl.calculateBudget();
      //2. return the budget
      var budget = budgetCtrl.getBudget();
      //3. display the budget on the UI
      UICtrl.displayBudget(budget);
   }
   
   var ctrlAddItem = function(){
      var input, newItem;
      // 1. Get the field input data
      input = UICtrl.getInput();

      if(input.description !== "" && !isNaN(input.value) && input.value > 0){

      
      //2. add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      //3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      //4. clear the fields
      UICtrl.clearFields();
      //5. calculate and update budget
      updateBudget();
      }
      
   };

   var ctrlDeleteItem = function(event){
      var itemID,splitID,ID;

      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
      if(itemID){

         //inc-1
         splitID = itemID.split('-');
         type = splitID[0];
         ID = parseInt(splitID[1]);

         //1 . delete the item from the data structure
         budgetCtrl.deleteItem(type, ID);
         //2. delete the item from the UI
         UICtrl.deleteListItem(itemID);
         //3. update and show the new budget
         updateBudget();

      }
   };

   return{
      init: function(){
         console.log('application has started');
         UICtrl.displayBudget( {
               budget: 0,
               totalInc: 0,
               totalExp: 0,
               percentage: -1
         });   
         setUpEventListeners();
      }
   };
  

})(budgetController, UIController);

controller.init();