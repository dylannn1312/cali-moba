'use client';
import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { GameSection } from './components/layout/GameSection';
import { StatusSection } from './components/layout/StatusSection';
import { Footer } from './components/layout/Footer';
import { getUniqueSudoku } from './solver/UniqueSudoku';
import { useSudokuContext } from './context/SudokuContext';
import { Button, Modal, Typography } from 'antd';
import { SwishSpinner } from '../common/SwishSpinner';
import { useChain } from '@cosmos-kit/react';
import { isUndefined, set } from 'lodash';
import { toast } from 'react-toastify';
import { calculateFee } from '@cosmjs/stargate';
import { gasPrice } from '@/utils/chain';
import { GameAPI } from '@/api/gameAPI';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const { Title, Text } = Typography;
/**
 * Game is the main React component.
 */
export const SudokuGame = ({
  battle_id,
  onVerifySuccess,
  onClaimSuccess
}: {
  battle_id: number;
  onVerifySuccess: (txHash: string) => void;
  onClaimSuccess: (txHash: string) => void
}) => {
  /**
   * All the variables for holding state:
   * gameArray: Holds the current state of the game.
   * initArray: Holds the initial state of the game.
   * solvedArray: Holds the solved position of the game.
   * difficulty: Difficulty level - 'Easy', 'Medium' or 'Hard'
   * numberSelected: The Number selected in the Status section.
   * timeGameStarted: Time the current game was started.
   * mistakesMode: Is Mistakes allowed or not?
   * fastMode: Is Fast Mode enabled?
   * cellSelected: If a game cell is selected by the user, holds the index.
   * history: history of the current game, for 'Undo' purposes.
   * overlay: Is the 'Game Solved' overlay enabled?
   * won: Is the game 'won'?
   */
  let { numberSelected, setNumberSelected,
    gameArray, setGameArray,
    difficulty, setDifficulty,
    setTimeGameStarted,
    fastMode, setFastMode,
    cellSelected, setCellSelected,
    initArray, setInitArray,
    setWon } = useSudokuContext();
  let [mistakesMode, setMistakesMode] = useState<boolean>(false);
  let [history, setHistory] = useState<string[][]>([]);
  let [solvedArray, setSolvedArray] = useState<string[]>([]);
  let [overlay, setOverlay] = useState<boolean>(false);

  /**
   * Creates a new game and initializes the state variables.
   */
  function _createNewGame(e?: React.ChangeEvent<HTMLSelectElement>) {
    let [temporaryInitArray, temporarySolvedArray] = getUniqueSudoku(difficulty, e);

    setInitArray(temporaryInitArray);
    setGameArray(temporaryInitArray);
    setSolvedArray(temporarySolvedArray);
    setNumberSelected('0');
    setTimeGameStarted(moment());
    setCellSelected(-1);
    setHistory([]);
    setWon(false);
  }

  /**
   * Checks if the game is solved.
   */
  function _isSolved(index: number, value: string) {
    if (gameArray.every((cell: string, cellIndex: number) => {
      if (cellIndex === index)
        return value === solvedArray[cellIndex];
      else
        return cell === solvedArray[cellIndex];
    })) {
      return true;
    }
    return false;
  }

  /**
   * Fills the cell with the given 'value'
   * Used to Fill / Erase as required.
   */
  function _fillCell(index: number, value: string) {
    if (initArray[index] === '0') {
      // Direct copy results in interesting set of problems, investigate more!
      let tempArray = gameArray.slice();
      let tempHistory = history.slice();

      // Can't use tempArray here, due to Side effect below!!
      tempHistory.push(gameArray.slice());
      setHistory(tempHistory);

      tempArray[index] = value;
      setGameArray(tempArray);

      if (_isSolved(index, value)) {
        console.log(gameArray);
        setGameSolved(true);
        setWon(true);
      }
    }
  }

  /**
   * A 'user fill' will be passed on to the
   * _fillCell function above.
   */
  function _userFillCell(index: number, value: string) {
    if (mistakesMode) {
      if (value === solvedArray[index]) {
        _fillCell(index, value);
      }
      else {
        // TODO: Flash - Mistakes not allowed in Mistakes Mode
      }
    } else {
      _fillCell(index, value);
    }
  }

  /**
   * On Click of 'New Game' link,
   * create a new game.
   */
  function onClickNewGame() {
    _createNewGame();
  }

  /**
   * On Click of a Game cell.
   */
  function onClickCell(indexOfArray: number) {
    if (fastMode && numberSelected !== '0') {
      _userFillCell(indexOfArray, numberSelected);
    }
    setCellSelected(indexOfArray);
  }

  /**
   * On Change Difficulty,
   * 1. Update 'Difficulty' level
   * 2. Create New Game
   */
  function onChangeDifficulty(e: React.ChangeEvent<HTMLSelectElement>) {
    setDifficulty(e.target.value);
    _createNewGame(e);
  }

  /**
   * On Click of Number in Status section,
   * either fill cell or set the number.
   */
  function onClickNumber(number: string) {
    if (fastMode) {
      setNumberSelected(number)
    } else if (cellSelected !== -1) {
      _userFillCell(cellSelected, number);
    }
  }

  /**
   * On Click Undo,
   * try to Undo the latest change.
   */
  function onClickUndo() {
    if (history.length) {
      let tempHistory = history.slice();
      let tempArray = tempHistory.pop();
      setHistory(tempHistory);
      if (tempArray !== undefined)
        setGameArray(tempArray);
    }
  }

  /**
   * On Click Erase,
   * try to delete the cell.
   */
  function onClickErase() {
    if (cellSelected !== -1 && gameArray[cellSelected] !== '0') {
      _fillCell(cellSelected, '0');
    }
  }

  /**
   * On Click Hint,
   * fill the selected cell if its empty or wrong number is filled.
   */
  function onClickHint() {
    if (cellSelected !== -1) {
      _fillCell(cellSelected, solvedArray[cellSelected]);
    }
  }

  /**
   * Toggle Mistakes Mode
   */
  function onClickMistakesMode() {
    setMistakesMode(!mistakesMode);
  }

  /**
   * Toggle Fast Mode
   */
  function onClickFastMode() {
    if (fastMode) {
      setNumberSelected('0');
    }
    setCellSelected(-1);
    setFastMode(!fastMode);
  }

  /**
   * Close the overlay on Click.
   */
  function onClickOverlay() {
    setOverlay(false);
    _createNewGame();
  }

  /**
   * On load, create a New Game.
   */
  useEffect(() => {
    _createNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const router = useRouter();

  const [gameSolved, setGameSolved] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const privateProof = useRef(false);

  const { getSigningCosmWasmClient, address } = useChain(process.env.CHAIN_NAME);

  const solution = [
    1, 4, 5, 6, 2, 3, 4, 5, 9, 2, 3, 6, 7, 2, 3, 6, 1, 7, 9, 4, 5, 8, 1, 2, 5, 8, 4, 3, 9,
    6, 7, 7, 6, 4, 9, 1, 5, 3, 8, 2, 3, 9, 8, 6, 2, 7, 5, 1, 4, 5, 8, 2, 3, 6, 1, 7, 4, 9,
    6, 1, 3, 7, 9, 4, 8, 2, 5, 9, 4, 7, 5, 8, 2, 1, 3, 6,
  ];

  return (
    <>
      <div className={"container"}>
        {/* <Header onClick={onClickNewGame} /> */}
        <div className="innercontainer">
          <GameSection
            onClick={(indexOfArray: number) => onClickCell(indexOfArray)}
          />
          <StatusSection
            onClickNumber={(number: string) => onClickNumber(number)}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChangeDifficulty(e)}
            onClickUndo={onClickUndo}
            onClickErase={onClickErase}
            onClickHint={onClickHint}
            onClickMistakesMode={onClickMistakesMode}
            onClickFastMode={onClickFastMode}
          />
        </div>
      </div>
      <Modal
        open={gameSolved}
        // destroyOnClose
        width={600}
        footer={[]}
        closeIcon={null}
        classNames={{
          content: '!p-0 !rounded-xl !bg-transparent',
        }}
      >
        <div className="flex flex-col justify-center border-2 border-primary p-8 rounded-xl bg-secondary items-center">
          <Title level={2} className='uppercase text-center'>
            You <Text className='text-primary'>Won</Text> the game
            <Image src={"https://content.imageresizer.com/images/memes/Congratulations-Man-meme-4.jpg"} alt='' width={450} height={200} className='rounded-xl' />
          </Title>
          {claimed ? (
            <>
              <div className="flex flex-col items-center justify-center gap-3">
                <Title level={4} className='uppercase !mb-0'>
                  Your reward was <Text className='text-primary'>claimed</Text> successfully
                </Title>
                <Text className='text-muted font-semibold'>Check your wallet balance</Text>
                <div className="flex gap-3 font-bold">
                  <Button className='py-5 text-muted' onClick={() => router.push('/')}>
                    Go to home
                  </Button>
                  <Button type='primary' className='py-5' onClick={() => router.push('/new-battle')}>
                    Play new game
                  </Button>
                </div>
              </div>
            </>
          ) : (
            proofSubmitted ? (
              claiming ? (
                <Text className='text-lg font-semibold text-muted'>Claiming reward...</Text>
              ) : (
                <>
                  <Title level={4} className='uppercase'>
                    Your solution was <Text className='text-primary'>verified</Text> successfully
                  </Title>
                  <Button type="primary" className='py-5 font-bold' onClick={handleClaimReward}>
                    Claim my reward
                  </Button>
                </>
              )
            ) : (
              <>
                <Title level={4} >
                  Do you want to prove your solution with <Text className='text-primary'>zkVM</Text>?
                </Title>
                {
                  generatingProof ? (
                    <Text className='text-lg font-semibold text-muted'>Generating proof...</Text>
                  ) : (
                    submittingProof ? (
                      <Text className='text-lg font-semibold text-muted'>Submitting your {privateProof.current ? "proof" : "solution"}</Text>
                    ) : (
                      (() => {
                        return (
                          <>
                            <div className="flex gap-3 font-bold">
                              <Button className='py-5 text-muted' onClick={handlePublicSolution}>
                                No, Public my solution to Xion
                              </Button>
                              <Button type='primary' className='py-5' onClick={handleProveSolution}>
                                Yeah, Prove it
                              </Button>
                            </div>
                            <Text className='text-xs text-muted font-semibold mt-2'>*This could take over a few minutes</Text>
                          </>
                        )
                      })()
                    )
                  )
                }
              </>
            )
          )}
          {(generatingProof || submittingProof || claiming) && <SwishSpinner />}
        </div >
      </Modal >
    </>
  );

  async function handlePublicSolution() {
    privateProof.current = false;
    if (isUndefined(address)) {
      toast.error("Please connect to your wallet first");
    } else {
      try {
        const client = await getSigningCosmWasmClient();
        setSubmittingProof(true);

        const tx = await client.execute(
          address,
          process.env.SUDOKU_CONTRACT,
          {
            submit_solution: {
              battle_id,
              solution: {
                public: solution
              }
            }
          },
          calculateFee(200000, gasPrice),
        );
        setProofSubmitted(true);
        onVerifySuccess(tx.transactionHash);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("unknown error");
        }
      }
      setSubmittingProof(false);
    }

  }

  async function handleProveSolution() {
    privateProof.current = true;
    if (isUndefined(address)) {
      toast.error("Please connect to your wallet first");
    } else {
      try {
        setGeneratingProof(true);
        const proof = await GameAPI.generateProof([[0, 8], [1, 7], [7, 9], [14, 8], [17, 1]], solution);
        setGeneratingProof(false);

        const client = await getSigningCosmWasmClient();
        setSubmittingProof(true);

        const tx = await client.execute(
          address,
          process.env.SUDOKU_CONTRACT,
          {
            submit_solution: {
              battle_id,
              solution: {
                private: {
                  proof: {
                    groth16: proof.proof_bytes
                  },
                  public_values: proof.public_input_bytes
                }
              }
            }
          },
          calculateFee(200000, gasPrice),
        );
        setProofSubmitted(true);
        onVerifySuccess(tx.transactionHash);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("unknown error");
        }
      }
      setSubmittingProof(false);
      setGeneratingProof(false);
    }
  }

  async function handleClaimReward() {
    if (isUndefined(address)) {
      toast.error("Please connect to your wallet first");
    } else {
      try {
        setClaiming(true);
        const client = await getSigningCosmWasmClient();
        setClaimed(false);
        const tx = await client.execute(
          address,
          process.env.SUDOKU_CONTRACT,
          {
            claim_reward: {
              battle_id
            }
          },
          calculateFee(200000, gasPrice),
        );
        setClaimed(true);
        onClaimSuccess(tx.transactionHash);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("unknown error");
        }
      }
      setClaiming(false);
    }
  }
}
