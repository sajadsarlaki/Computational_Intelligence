# Fuzzy c means clustering algorithm
import csv
import random
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy.spatial import distance


def calc_difference(arr):
    a = []
    a.append(arr[0])
    for i in range(1, len(arr)):
        a.append(arr[i] - arr[i - 1])
        i = i - 1
    return a


def fcm(k, data):
    p = 2

    X = pd.DataFrame(data)


    n = len(X)
    d = len(X.columns)
    add_zeros = np.zeros((n, 1))
    X = np.append(X, add_zeros, axis=1)


    # Create an empty array of centers
    C = np.zeros((k, d + 1))


    weight = []
    # Randomly initialize the weight matrix
    for x in range(n):
        node = []
        for j in range(k - 1):
            rand = random.uniform(0, 1)
            while not rand:
                rand = random.uniform(0, 1)
            node.append(rand)

        node.append(1)
        node.sort()

        arr = np.array(calc_difference(node))
        weight.append(arr)
    weight = np.array(weight)



    for it in range(40):  # Total number of iterations

        # Compute centroid
        for j in range(k):
            denoSum = sum(np.power(weight[:, j], 2))

            sumMM = 0
            for i in range(n):
                mm = np.multiply(np.power(weight[i, j], p), X[i, :])

                sumMM += mm
            cc = sumMM / denoSum
            C[j] = np.reshape(cc, d + 1)

        for i in range(n):
            denoSumNext = 0
            for j in range(k):
                denoSumNext += np.power(1 / distance.euclidean(C[j, 0:d], X[i, 0:d]), 1 / (p - 1))
            for j in range(k):
                w = np.power((1 / distance.euclidean(C[j, 0:d], X[i, 0:d])), 1 / (p - 1)) / denoSumNext
                weight[i, j] = w


    for i in range(n):
        cNumber = np.where(weight[i] == np.amax(weight[i]))
        X[i, d] = cNumber[0]


    # Sum squared error calculation
    SSE = 0
    for j in range(k):
        for i in range(n):
            SSE += np.power(weight[i, j], p) * distance.euclidean(C[j, 0:d], X[i, 0:d])


    return [SSE, X]
    # ====================================================


def visualize(data_points, ds_number):
    def cluster(c):
        switcher = {
            0: 'r.',
            1: 'b+',
            2: 'y*',
            3: 'g.',
            4: 'r+',
            5: "b*",
            6: 'y-',
            7: 'c.',
            8: 'r*',
            9: "b.",
            10: "y."

        }
        return switcher.get(c, "Invalid")

    for x in data_points:
        plt.plot(x[0], x[1], cluster(x[2]))
        plt.title("Test case number :" + ds_number)
    plt.show()


def run_fcm(dataset, ds_number):
    final = []
    res = fcm(2, dataset)
    last_sse = res[0]
    i = 0
    for i in range(3, 10):
        res = fcm(i, dataset)
        current_sse = res[0]
        difference = last_sse - current_sse
        if float(difference / current_sse) > 0.6:
            final = res
            break
    print("test case: ", ds_number)
    print("number of clusters: ", i)
    print("SSE: ", final[0])
    print(50*"-")
    dim = len(final[1][0]) - 1
    if dim == 2:
        visualize(final[1], str(ds_number))


def main():
    for ds_number in range(1, 6):
        dataset = []
        with open('./data_set/sample' + str(ds_number) + '.csv') as csvDataFile:
            csvReader = csv.reader(csvDataFile)
            for row in csvReader:
                data_point = []

                for i in range(len(row)):
                    data_point.append(float(row[i]))

                dataset.append(data_point)
        run_fcm(dataset, ds_number)


main()
