import onePlusLambdaInitialiser from './onePlusLambda'

export default function initializeAlgorithms(instance) {
  return {
    onePlusLambda: onePlusLambdaInitialiser(instance),
  }
}
