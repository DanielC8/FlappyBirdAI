from os import pardir
import numpy as np
from genetic import Genetic_AI
import random
import pandas as pd
from flappybird import mains


def cross(a1, a2, aggregate="uniform"):
    """
    Improved crossover with multiple strategies
    """
    new_genotype = []
    
    if aggregate == "uniform":
        # Uniform crossover - randomly select from each parent
        for i in range(len(a1.genotype)):
            if random.random() < 0.5:
                new_genotype.append(a1.genotype[i])
            else:
                new_genotype.append(a2.genotype[i])
    elif aggregate == "blend":
        # Blend crossover - weighted average based on fitness
        total_fitness = a1.fit_score + a2.fit_score
        if total_fitness > 0:
            w1 = a1.fit_score / total_fitness
            w2 = a2.fit_score / total_fitness
        else:
            w1 = w2 = 0.5
        
        for i in range(len(a1.genotype)):
            new_gene = w1 * a1.genotype[i] + w2 * a2.genotype[i]
            new_genotype.append(new_gene)
    else:  # single-point crossover
        crossover_point = random.randint(1, len(a1.genotype) - 1)
        new_genotype = (a1.genotype[:crossover_point].tolist() + 
                       a2.genotype[crossover_point:].tolist())

    return Genetic_AI(genotype=np.array(new_genotype), mutate=True)


def compute_fitness(agent, num_trials):
    """
    Enhanced fitness computation with outlier handling
    """
    fitness = []
    for trial in range(num_trials):
        # Reset agent's previous_y for each trial
        agent.previous_y = None
        score = mains(agent1=agent)
        fitness.append(score)
        print(f"    Trial: {trial+1}/{num_trials} - Score: {score:.2f}")

    fitness_array = np.array(fitness)
    
    # Remove outliers (scores more than 2 std devs from mean) for stability
    if len(fitness) > 2:
        mean_fit = np.mean(fitness_array)
        std_fit = np.std(fitness_array)
        if std_fit > 0:
            filtered_fitness = fitness_array[np.abs(fitness_array - mean_fit) <= 2 * std_fit]
            if len(filtered_fitness) > 0:
                return np.mean(filtered_fitness)
    
    return np.mean(fitness_array)


def run_X_epochs(num_epochs=10, num_trials=5, pop_size=100, aggregate='lin', num_elite=5, survival_rate=.35,
                 logging_file='default.csv'):
    # data collection over epochs
    data = [[1, np.ones(4), 1, np.ones(4), 1, np.ones(4)]]
    headers = ['avg_fit', 'avg_gene', 'top_fit', 'top_gene', 'elite_fit', 'elite_gene']
    df = pd.DataFrame(data, columns=headers)
    df.to_csv(f'data/{logging_file}.csv', index=False)

    # create initial population with diversity
    population = [Genetic_AI() for _ in range(pop_size)]

    for epoch in range(num_epochs):
        """
        Fitness
        """

        # data collection within epochs
        total_fitness = 0
        top_agent = 0
        gene_size = len(population[0].genotype)
        gene = np.zeros(gene_size)

        for n in range(pop_size):
            # compute fitness, add to total
            print(f"Agent: {n}/{pop_size}")
            agent = population[n]
            agent.fit_score = compute_fitness(agent, num_trials=num_trials)
            total_fitness += agent.fit_score
            gene += agent.genotype

        # compute % of fitness accounted for by each agent
        for agent in population:
            agent.fit_rel = agent.fit_score / total_fitness

        """
        Selection
        """

        next_gen = []

        # sort population by descending fitness
        sorted_pop = sorted(population, reverse=True)

        # elite selection: copy over genotypes from top performing agents
        elite_fit_score = 0
        elite_genes = np.zeros(gene_size)
        top_agent = sorted_pop[0]

        for i in range(num_elite):
            elite_fit_score += sorted_pop[i].fit_score
            elite_genes += sorted_pop[i].genotype
            next_gen.append(Genetic_AI(genotype=sorted_pop[i].genotype, mutate=False))

        # selection: select top agents as parents base on survival rate
        num_parents = round(pop_size * survival_rate)
        parents = sorted_pop[:num_parents]

        # crossover: tournament selection and crossover
        for _ in range(pop_size - num_elite):
            # Tournament selection for better parent selection
            parent1 = tournament_selection(parents, tournament_size=3)
            parent2 = tournament_selection(parents, tournament_size=3)
            
            # Ensure parents are different
            while parent1 is parent2 and len(parents) > 1:
                parent2 = tournament_selection(parents, tournament_size=3)
            
            next_gen.append(cross(parent1, parent2, aggregate=aggregate))

        avg_fit = (total_fitness / pop_size)
        avg_gene = (gene / pop_size)
        top_fit = (top_agent.fit_score)
        top_gene = (top_agent.genotype)
        elite_fit = (elite_fit_score / num_elite)
        elite_gene = (elite_genes / num_elite)

        data = [[avg_fit, avg_gene, top_fit, top_gene, elite_fit, elite_gene]]
        df = pd.DataFrame(data, columns=headers)
        df.to_csv(f'data/{logging_file}.csv', mode='a', index=False, header=False)

        print(
            f'\nEpoch {epoch}: \n    total fitness: {total_fitness / pop_size}\n    best agent: {top_agent.fit_score}\n')

        population = next_gen

    return data


def tournament_selection(population, tournament_size=3):
    """
    Tournament selection for better parent selection
    """
    tournament = random.sample(population, min(tournament_size, len(population)))
    return max(tournament, key=lambda x: x.fit_score)


if __name__ == '__main__':
    run_X_epochs(num_epochs=50, num_trials=3, pop_size=50, num_elite=5, 
                 aggregate='blend', logging_file="enhanced_round1")
