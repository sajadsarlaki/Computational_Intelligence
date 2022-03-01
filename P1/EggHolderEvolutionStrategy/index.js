const Genetic = require("genetic-js");






//
const genetic = Genetic.create();
genetic.optimize = (a, b) => {
  return a >= b;
};
genetic.select1 = Genetic.Select1.Random;
genetic.select2 = Genetic.Select2.FittestRandom;

genetic.seed  = () => {
    // from stack overflow
    const randn_bm = () => {
      let u = 0,
        v = 0;
      while (u === 0) u = Math.random(); 
      while (v === 0) v = Math.random();
      let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      num = num / 10.0 + 0.5; 
      if (num >= 1 || num < 0) return randn_bm(); 
      return num;
    };
  
    return {
      x: (Math.random() * 512 * 2) - 512,
      y: (Math.random() * 512 * 2 )- 512,
      step: 45,
    };
  };
  
  genetic.fitness = (entity) => {
    const Eggholder = (x, y) =>
      (-1 * (y + 47) * Math.sin(Math.sqrt(Math.abs(y + x / 2 + 47)))) -(
      x * Math.sin(Math.sqrt(Math.abs(x - (y + 47)))));
  
    if (
      Math.abs(entity.x) > 512 ||
      Math.abs(entity.y) > 512
    )
      return 0;
    return (
      1 / Math.abs((-959.6407) - Eggholder(entity.x, entity.y))
    );
  };
  
  genetic.mutate = (entity) => {
    function randn_bm() {
        var u = 0, v = 0;
        while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    }
    // mutate step
    entity.step = entity.step * Math.exp(-1 * 0.04 *randn_bm());
    if (randn_bm() > 0) {
      entity.x = entity.x + entity.step * randn_bm(); //% thistep.userData.DOMAIN;
    } else {
      entity.y = entity.y + entity.step * randn_bm(); // % this.userData.DOMAIN;
    }
  
    return entity;
  };
  
  genetic.crossover = (mother, father) => {
      let son = {
        x: mother.x - (mother.x - father.x) / 2, 
        y: mother.y - (mother.y - father.y) / 2, 
        step: father.step,
      }
      let dauther =  
      {
        x: father.x + (mother.x - father.x) / 2, 
        y: father.y + (mother.y - father.y) / 2, 
        step: mother.step,
      }
    return [son,dauther];
  };

  
genetic.generation = (pop, generation, stats) => {
  
};

//
genetic.notification = (pop, generation, stats, isFinished) => {

    console.log(
        " genration : " +
          generation +
          "|  best fitness :" +
          pop[0].fitness +
          "|  min :" +
          (stats.minimum) +
          "|  mean :" +
          (stats.mean)
      );
      
  if (isFinished) {
    
    const Eggholder = (x, y) =>
      (-1 * (y + 47) * Math.sin(Math.sqrt(Math.abs(y + x / 2 + 47)))) -(
      x * Math.sin(Math.sqrt(Math.abs(x - (y + 47)))))
    console.log(
      "=========================== \n" +
      "result :  \n x = " +
        pop[0].entity.x +
        ",\n y = " +
        pop[0].entity.y +
        " \nEggholder result = " +
        Eggholder(pop[0].entity.x, pop[0].entity.y)
    );
  }
};




genetic.evolve(
  {
    iterations: 100,
    size: 18000,
    crossover: 0.6,
    mutation: 0.3,
    skip: 1,
  },
);
