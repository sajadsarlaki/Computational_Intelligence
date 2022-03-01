
import numpy as np
import csv
import matplotlib.pyplot  as plt
import math

class NeuralNetwork():
    
    def prepare_inputs(self, dataset):
        size = len(dataset)
        tranning_size = math.floor(size*0.75)

        tranning_inputs = []
        tranning_outputs = []

        test_inputs = []
        test_outputs = []

        for i in range(tranning_size):
            tranning_inputs.append([dataset[i][0],dataset[i][1]])
            tranning_outputs.append(dataset[i][2])

        for j in range(tranning_size, size):
            test_inputs.append([dataset[j][0],dataset[j][1]])
            test_outputs.append(dataset[j][2])

        return [tranning_inputs,[tranning_outputs],test_inputs,[test_outputs]] 

    def read_data(self, addr):
        dataset = []
        with open(addr) as csvfilereader:
                    csvreader = csv.reader(csvfilereader)
                    for row in csvreader:
                        data_point = []
                        if row[0] == 'x1':
                            continue
                        for i in range(len(row)):
                            data_point.append(float(row[i]))

                        dataset.append(data_point)
        return dataset
   
    def visualize(self, dataset , mode):
        def cls(c):
            switcher = {
                0: 'r.',
                1: 'y*'
                
            }
            return switcher.get(c, "Invalid")
        size = len(dataset)

        if not mode : # for raw dataset visulizing
            train_data_size = math.floor(size*0.75)

            plt.figure()

            plt.subplot(211)
            plt.title("tranning data")
            for j in range(0,train_data_size):
                plt.plot(dataset[j][0], dataset[j][1], cls(dataset[j][2]))
            
            plt.subplot(212)
            plt.title("test data")

            for k in range(train_data_size, size):
                plt.plot(dataset[k][0], dataset[k][1], cls(dataset[k][2]))
        
        else:
            for l in dataset: 
                plt.plot(l[0], l[1], cls(l[2]))
        plt.show()
   
    def __init__(self):
        # seeding for random number generation
        np.random.seed(1)
    
        self.synaptic_weights = 2 * np.random.normal(0,1,(3, 1)) - 1
        self.sec_synaptic_weights = 2 * np.random.normal(0,1,(3, 1)) - 1
        self.third_synaptic_weights = 2 * np.random.normal(0,1,(3, 1)) - 1

    def sigmoid(self, x):
        # print(x)
        #applying the sigmoid function
        return  1 / (1 + np.exp(-x))

    def sigmoid_derivative(self, x):
        #computing derivative to the Sigmoid function
        return x * (1 - x)

    def train(self, training_inputs, training_outputs, training_iterations):
        
        for iteration in range(training_iterations):
            
            think_output = self.think_l2(training_inputs)
            output = think_output[2]
    
            error = training_outputs - output
            adjustments = np.dot(training_inputs.T, 0.015 * error * self.sigmoid_derivative(output))
# -------------------------------------------------------------------------------------------------   
            error_l1 = (training_outputs - output) * self.third_synaptic_weights[0] * think_output[0]*(1-think_output[0])
            adjustments_l1 = np.dot(training_inputs.T, 0.015 * error_l1 * self.sigmoid_derivative(output))
            
# --------------------------------------------------------------------------------------------------
            error_l2 = (training_outputs - output) * self.third_synaptic_weights[1] * think_output[1] * (1-think_output[1])
            adjustments_l2 = np.dot(training_inputs.T, 0.015 * error_l2 * self.sigmoid_derivative(output))
            
            self.sec_synaptic_weights += adjustments_l2
            self.synaptic_weights += adjustments_l1
            self.third_synaptic_weights += adjustments






    def think(self, inputs, weights):
        #passing the inputs via the neuron to get output   
        #converting values to floats
        
        output = self.sigmoid(np.dot(inputs, weights))

        return output;

    def think_l2(self, inputs):
        
        inputs = np.array(inputs, dtype="float64")

        l2_inputs_1 = self.think(inputs,self.synaptic_weights)
       
        l2_inputs_2 = self.think(inputs,self.sec_synaptic_weights)
        
        l3_inputs = []
        for i in range(len(l2_inputs_1)):
            node = [l2_inputs_1[i][0], l2_inputs_2[i][0], 1]
            l3_inputs.append(node)
        
        l3_inputs = np.array(l3_inputs)
        # print(l3_inputs)
        output = self.sigmoid(np.dot(l3_inputs, self.third_synaptic_weights))
    
        
        return [l2_inputs_1, l2_inputs_2, output]

if __name__ == "__main__":

    neural_network = NeuralNetwork()
    dataset = neural_network.read_data("./dataset.csv")
    data = neural_network.prepare_inputs(dataset)


    for x in data[0]:
        x.append(1)
    training_inputs = np.array(data[0],dtype="float64")
    training_outputs = np.array(data[1]).T
    
    neural_network.train(training_inputs, training_outputs, 1600)

   
    counter = 0
    for x in data[2]:
        x.append(1)
    test_data = np.array(data[2],dtype="float64")

    test_outputs = np.array(data[3])

    final_data = []
   
    for d in range(len(test_data)) :
        ann_res = neural_network.think_l2(np.array([test_data[d]]))[2]
        
        
        if(ann_res[0] > 0.5):
            ann_res[0] = 1 
        else: 
            ann_res[0] = 0    

        final_data.append(np.array([test_data[d][0],test_data[d][1] ,ann_res[0][0]]))
        if test_outputs[0][d] == ann_res[0]:
            counter += 1
    np.array(final_data)

    print("Result = ",counter/len(final_data))

    neural_network.visualize(final_data,1)
    
