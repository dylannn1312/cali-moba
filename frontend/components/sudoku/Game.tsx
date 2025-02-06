'use client';
import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { GameSection } from './components/layout/GameSection';
import { StatusSection } from './components/layout/StatusSection';
import { getUniqueSudoku } from './solver/UniqueSudoku';
import { useSudokuContext } from './context/SudokuContext';
import { Button, Modal, Typography } from 'antd';
import { SwishSpinner } from '../common/SwishSpinner';
import { isUndefined, set } from 'lodash';
import { toast } from 'react-toastify';
import { GameAPI } from '@/api/gameAPI';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SudokuCaller } from '@/api/calimeroService';
import { getStoragePanic, StorageKey } from '@/utils/storage';
import { useAuth } from '@nfid/identitykit/react';
import useSWR from 'swr';

const { Title, Text } = Typography;
/**
 * Game is the main React component.
 */
export const SudokuGame = ({
  battleId,
  onVerifySuccess,
  onClaimSuccess
}: {
  battleId: number;
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

  // const [initialState, setInitialState] = useState<[number, number][]>([]);
  const { user: currentWallet } = useAuth();
  const sudokuCaller = useRef(new SudokuCaller(getStoragePanic(StorageKey.NODE_URL)));
  const userPrincipal = currentWallet?.principal.toString();



  let { data: lastChangedCell, error: lastChangedCellErr } = useSWR("get_last_changed_cell", () => sudokuCaller.current.getLastChangedCell(), {
    refreshInterval: 1000,
  });

  let { data: lastRemovedCell, error: lastRemovedCellErr } = useSWR("get_last_removed_cell", () => sudokuCaller.current.getLastRemovedCell(), {
    refreshInterval: 1000,
  });
  console.log({lastChangedCell});

  useEffect(() => {
    if (lastChangedCellErr) {
      toast.error(JSON.stringify(lastChangedCellErr));
    }
    if (lastRemovedCellErr) {
      toast.error(JSON.stringify(lastRemovedCellErr));
    }
  }, [lastChangedCellErr, lastRemovedCellErr]);

  useEffect(() => {
    if (lastChangedCell && gameArray[lastChangedCell.position] !== lastChangedCell.value.toString() && userPrincipal && lastChangedCell.editor_address !== userPrincipal) {
      setGameArray((prev) => {
        let temp = prev.slice();
        temp[lastChangedCell.position] = lastChangedCell.value.toString();
        toast.info(`Cell ${lastChangedCell.position} changed to ${lastChangedCell.value} by ${lastChangedCell.editor_name} (${lastChangedCell.editor_address})`);
        return temp;
      });
    }
  }, [lastChangedCell, setGameArray]);

  useEffect(() => {
    if (lastRemovedCell && gameArray[lastRemovedCell.position] !== '0' && userPrincipal && lastRemovedCell.editor_address !== userPrincipal) {
      setGameArray((prev) => {
        let temp = prev.slice();
        temp[lastRemovedCell.position] = '0';
        toast.info(`Cell ${lastRemovedCell.position} removed by ${lastRemovedCell.editor_name} (${lastRemovedCell.editor_address})`);
        return temp;
      });
    }
  }, [lastRemovedCell, setGameArray]);

  const {
    data: battleInfo,
    isLoading: isBattleInfoLoading
  } = useSWR(["battle-info", battleId], ([_, battleId]) => GameAPI.getBattleInfo(battleId));

  useEffect(() => {
    async function handle() {
      try {
        if (initArray.length > 0) {

          if (userPrincipal && userPrincipal === battleInfo?.creator) {
            const initialState: [number, number][] = [];
            for (let i = 0; i < initArray.length; i++) {
              if (initArray[i] !== '0') {
                initialState.push([i, parseInt(initArray[i])]);
              }
            }

            await GameAPI.startGame(initialState, battleId);
          } else {
            if (battleInfo?.initial_state) {
              let g = Array(81).fill('0');
              battleInfo?.initial_state?.forEach(([index, value]) => {
                g[index] = value.toString();
              });
              setGameArray(g);
              setInitArray(g);
            }
          }
        }
      } catch (err) {
        toast.error(JSON.stringify(err));
      }
    }
    handle();
  }, [battleId, battleInfo?.creator, battleInfo?.initial_state, initArray, userPrincipal])


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
  async function _fillCell(index: number, value: string) {
    if (isUndefined(userPrincipal)) {
      toast.error("Connect wallet first");
      return;
    }
    if (initArray[index] === '0' && gameArray[index] !== value) {
      try {
        await sudokuCaller.current.setCell({
          position: index,
          value: parseInt(value),
          editor_address: userPrincipal,
          editor_name: getStoragePanic(StorageKey.NODE_NAME)
        });
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
      } catch (err) {
        toast.error(JSON.stringify(err));
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

  //   const {
  //     data: battleInfo,
  //     isLoading: isBattleInfoLoading
  // } = useSWR(["battle-info", battleId], ([_, battleId]) => GameAPI.getBattleInfo(battleId));

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
  const [proofSubmitted, setProofSubmitted] = useState(false);

  const privateProof = useRef(false);

  return (
    <>
      <div className={"container"}>
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
          {proofSubmitted ? (
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
          ) : (
            <>
              <Title level={4} >
                Do you want to prove your solution with <Text className='text-primary'>zkVM</Text>?
              </Title>
              {
                submittingProof ? (
                  <Text className='text-lg font-semibold text-muted'>Submitting your {privateProof.current ? "proof" : "solution"}</Text>
                ) : (
                  (() => {
                    return (
                      <>
                        <div className="flex gap-3 font-bold">
                          <Button className='py-5 text-muted' onClick={() => handleSolution(true)}>
                            No, Public my solution to IC Network
                          </Button>
                          <Button type='primary' className='py-5' onClick={() => handleSolution(false)}>
                            Yeah, Prove it
                          </Button>
                        </div>
                        <Text className='text-xs text-muted font-semibold mt-2'>*This could take over a few minutes</Text>
                      </>
                    )
                  })()
                )
              }
            </>
          )}
          {(submittingProof) && <SwishSpinner />}
        </div >
      </Modal >
      {/* <Button onClick={async() => { let r = await sudokuCaller.current.getLastChangedCell(); toast.info(JSON.stringify(r)); }}>
        hehe
      </Button> */}
    </>
  );

  async function handleSolution(isPublic: boolean) {
    privateProof.current = !isPublic;
    try {
      setSubmittingProof(true);
      await GameAPI.submitBattleProof(battleId, [
        1, 4, 5, 6, 2, 3, 4, 5, 9, 2, 3, 6, 7, 2, 3, 6, 1, 7, 9, 4, 5, 8, 1, 2, 5, 8, 4, 3, 9,
        6, 7, 7, 6, 4, 9, 1, 5, 3, 8, 2, 3, 9, 8, 6, 2, 7, 5, 1, 4, 5, 8, 2, 3, 6, 1, 7, 4, 9,
        6, 1, 3, 7, 9, 4, 8, 2, 5, 9, 4, 7, 5, 8, 2, 1, 3, 6,
      ], isPublic, []);
      setProofSubmitted(true);
    } catch (error) {
      toast.error(JSON.stringify(error));
    }
    setSubmittingProof(false);
  }
}
