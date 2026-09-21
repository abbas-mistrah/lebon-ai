# LeBon AI

Assistant IA pour leboncoin dont l’inférence est exécutée exclusivement en local avec Ollama : chat, Code Studio, Work Agent contrôlé, micro-apps, simulation ROI et Second Brain.

## Démarrage

Prérequis : Windows, Node.js 20+ et Ollama actif sur `127.0.0.1:11434`.

```powershell
ollama pull gemma3:1b
ollama pull qwen2.5:3b
ollama pull qwen2.5:1.5b
ollama create lebon-ai:fast -f Modelfile.fast
node server.js
```

Ouvrir ensuite `http://127.0.0.1:4321`. Un second port compatible est disponible sur `4322`.

## Profils locaux mesurés sur ce PC

| Profil | Modèle | Débit observé | Usage |
| --- | --- | ---: | --- |
| Auto Local | `lebon-ai:auto` | environ 14 à 36 tok/s | recommandé : choisit automatiquement conversation ou travail |
| Conversation Naturelle | `gemma3:1b` | environ 36 tok/s | échanges informels plus spontanés en français |
| Travail Pro | `qwen2.5:3b` | environ 14,5 tok/s | rédaction, analyse et code avec plus de fiabilité |
| Travail Rapide | `qwen2.5:1.5b` | environ 29 tok/s | compromis léger pour les tâches pro simples |
| Local Rapide | `lebon-ai:fast` | environ 61,5 tok/s | tâches simples demandant peu de raisonnement |
| Local Ultra-rapide | `qwen2.5:0.5b` | environ 72,3 tok/s | micro-tâches et réponses courtes |
| Local 4B expérimental | `qwen3:4b` | environ 11 tok/s | usage ponctuel, nettement plus lent sur CPU |

Les débits varient selon la longueur du contexte, la température du CPU et les applications ouvertes. `lebon-ai:auto` est un routeur local : Gemma 3 1B traite les échanges sociaux et Qwen 2.5 3B les demandes professionnelles. Le 1.5B reste disponible quand la vitesse compte davantage que la profondeur. Aucune requête n'est envoyée dans le cloud.

Le bouton du composeur bascule réellement entre :

- **Auto** : `lebon-ai:auto`, sélection locale du moteur selon la demande.
- **Ultra-rapide** : `qwen2.5:0.5b`, contexte 2K et réponse jusqu’à 384 tokens.

## Verrouillage local

- Le catalogue ne publie aucun modèle distant.
- Une ancienne préférence distante ou un ancien profil est automatiquement migré vers `lebon-ai:auto`.
- Le serveur refuse le téléchargement d’un modèle qui n’appartient pas à la liste locale validée.
- Les conversations, agents, workspaces, Code Studio et Second Brain utilisent tous un modèle local.
- Le serveur écoute uniquement sur `127.0.0.1`.

Ce verrouillage concerne l’inférence IA. Les fonctions explicitement réseau, comme la recherche web ou certains connecteurs, peuvent toujours accéder à Internet lorsqu’un utilisateur les déclenche.

## Optimisations appliquées

- Les deux moteurs du profil Auto restent en mémoire pendant 30 minutes pour éviter les rechargements répétés.
- Préchargement de `gemma3:1b` et `qwen2.5:3b` au démarrage.
- Routeur d'intention local : le moteur conversationnel n'est utilisé que pour les échanges informels ; le moteur de travail prend les demandes structurées.
- Raisonnement caché désactivé pour réduire fortement la latence.
- 10 threads CPU (plus rapide que 12 ou 14 sur le Core Ultra 7 165U), batch 256 et contexte plafonné pour éviter la saturation mémoire.
- Streaming SSE sans attendre la réponse complète.
- Cache instantané déterministe pour les demandes simples prises en charge localement.

Pour conserver la vitesse : fermer les applications lourdes, brancher le PC sur secteur, utiliser le mode performance de Windows et réserver le 4B aux rares demandes où sa lenteur est acceptable.

## Garanties applicatives

- Une erreur Ollama reste une erreur visible, jamais une fausse réponse positive.
- Les conversations sont créées côté serveur avant le premier envoi, puis sauvegardées atomiquement.
- Le Work Agent reste en lecture seule sans autorisation explicite pour la mission.
- Un bloc de commande Markdown n’est jamais exécuté automatiquement.
- Les clés de connecteurs ne sont ni demandées ni stockées.
- Les connecteurs non branchés sont présentés comme des prévisualisations.
- Le connecteur Git lit réellement le dépôt local.

## Vérification

Avec le serveur lancé :

```powershell
node --check server.js
node --check app.js
node --test tests/test-server.js
```

La suite vérifie notamment le catalogue 100 % local, le refus d’un modèle distant, les en-têtes de sécurité, la santé Ollama et le cycle complet d’une conversation.

## Limites avant un déploiement collectif

- L’application reste un prototype local mono-utilisateur sans authentification d’entreprise.
- Les fichiers JSON ne remplacent pas une base transactionnelle multi-utilisateur.
- Les modèles sous le milliard de paramètres sont rapides mais moins fiables sur les tâches complexes : les réponses importantes doivent être relues.
- Plusieurs studios produisent des démonstrateurs HTML ; ils ne constituent pas encore des intégrations SI.
- Une revue sécurité, RGPD, architecture et marque leboncoin reste obligatoire avant toute mise à disposition interne.
