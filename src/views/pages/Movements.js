import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import MovementsService from '../../services/movements.service'
import List from './movements/List'
import Show from './movements/Show'

const Movements = () => {
  const dispatch = useDispatch()
  const [view, setView] = useState({ name: 'list', title: 'Listar Movimientos' })
  const [data, setData] = useState({})
  const [movement, setMovement] = useState({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (view.name === 'edit' && view.movement?.id) {
      findMovement(view.movement.id)
    }
    setLoading(true)
    setMovement('')
    if (view.name === 'list') {
      dispatch({ type: 'set', action: 'Listar Movimientos' })
    }
  }, [view])

  const changeView = (newView) => {
    setErrors({})
    dispatch({ type: 'set', action: newView.title })
    setView(newView)
  }

  const fetchMovements = async (params) => {
    try {
      const response = await MovementsService.all(params)
      setData(response.data)
    } catch (error) {
      setErrors(error.error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'create':
        return (
          <Create onChangeView={changeView} /*onSubmit={createHealthEntity}*/ errors={errors} />
        )

      case 'edit':
        return (
          <Edit
            //healthEntity={healthEntity}
            onChangeView={changeView}
            //onSubmit={editHealthEntity}
            errors={errors}
          />
        )

      case 'show':
        return (
          <Show
            movement={movement}
            onChangeView={changeView}
            //onSubmit={editHealthEntity}
            errors={errors}
          />
        )

      default:
        return (
          <List
            data={data}
            loading={loading}
            fetchMovements={fetchMovements}
            onChangeView={changeView}
            //deleteMovement={deleteMovement}
            //restore={restore}
            errors={errors}
          />
        )
    }
  }

  return <div>{renderView()}</div>
}

export default Movements
