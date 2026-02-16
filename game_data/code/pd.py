import pygambit as g
import numpy as np

# Create a new game table for 2 players with 2 strategies each
game = g.Game.new_table([2, 2])
game.title = "Prisoner's Dilemma"

# Label players
game.players[0].label = "Alice"
game.players[1].label = "Bob"

# Label strategies
game.players[0].strategies[0].label = "Cooperate"
game.players[0].strategies[1].label = "Defect"
game.players[1].strategies[0].label = "Cooperate"
game.players[1].strategies[1].label = "Defect"

# Set payoffs (Player 1, Player 2)
# R=Reward, P=Punishment, S=Sucker, T=Temptation
# R=3, P=1, S=0, T=5
game[0, 0][0] = 3  # R
game[0, 0][1] = 3  # R
game[0, 1][0] = 0  # S
game[0, 1][1] = 5  # T
game[1, 0][0] = 5  # T
game[1, 0][1] = 0  # S
game[1, 1][0] = 1  # P
game[1, 1][1] = 1  # P