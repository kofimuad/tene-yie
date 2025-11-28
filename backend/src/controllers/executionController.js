// src/controllers/executionController.js
import supabase from '../utils/supabaseClient.js';
import { executeWorkflow } from '../services/executionEngine.js';

export async function runWorkflow(req, res) {
  try {
    const { workflowId } = req.params;

    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('id')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const result = await executeWorkflow(workflowId);

    if (result.success) {
      return res.status(200).json({
        message: 'Workflow executed successfully',
        executionId: result.executionId,
        executionData: result.executionData
      });
    } else {
      return res.status(500).json({
        message: 'Workflow execution failed',
        executionId: result.executionId,
        error: result.error
      });
    }

  } catch (err) {
    console.error('Error running workflow:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getExecutionHistory(req, res) {
  try {
    const { workflow_id, limit = 10, offset = 0 } = req.query;

    if (!workflow_id) {
      return res.status(400).json({
        error: 'workflow_id query parameter required'
      });
    }

    const { data, error } = await supabase
      .from('executions')
      .select('*')
      .eq('workflow_id', workflow_id)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      executions: data,
      count: data.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (err) {
    console.error('Error fetching execution history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getExecutionDetails(req, res) {
  try {
    const { executionId } = req.params;

    const { data, error } = await supabase
      .from('executions')
      .select('*')
      .eq('id', executionId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.json(data);

  } catch (err) {
    console.error('Error fetching execution details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getExecutionStats(req, res) {
  try {
    const { workflowId } = req.params;

    const { data: executions, error } = await supabase
      .from('executions')
      .select('status')
      .eq('workflow_id', workflowId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const stats = {
      total: executions.length,
      completed: executions.filter(e => e.status === 'completed').length,
      failed: executions.filter(e => e.status === 'failed').length,
      running: executions.filter(e => e.status === 'running').length,
      successRate: executions.length > 0 
        ? ((executions.filter(e => e.status === 'completed').length / executions.length) * 100).toFixed(2)
        : 0
    };

    res.json(stats);

  } catch (err) {
    console.error('Error calculating stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}