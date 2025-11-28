// src/controllers/nodeController.js
import supabase from '../utils/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

export async function createNode(req, res) {
  try {
    const { workflow_id, node_type, label, config, position_x, position_y } = req.body;

    if (!workflow_id || !node_type || !label) {
      return res.status(400).json({
        error: 'Missing required fields: workflow_id, node_type, label'
      });
    }

    const validTypes = ['trigger', 'data', 'transform', 'action'];
    if (!validTypes.includes(node_type)) {
      return res.status(400).json({
        error: `Invalid node_type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('id')
      .eq('id', workflow_id)
      .single();

    if (workflowError || !workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const { data, error } = await supabase
      .from('nodes')
      .insert([{
        id: uuidv4(),
        workflow_id,
        node_type,
        label,
        config: config || {},
        position_x: position_x || 0,
        position_y: position_y || 0
      }])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Node created successfully',
      node: data[0]
    });
  } catch (err) {
    console.error('Error creating node:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getNodesByWorkflow(req, res) {
  try {
    const { workflow_id } = req.query;

    if (!workflow_id) {
      return res.status(400).json({ error: 'workflow_id query parameter required' });
    }

    const { data, error } = await supabase
      .from('nodes')
      .select('*')
      .eq('workflow_id', workflow_id)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      nodes: data,
      count: data.length
    });
  } catch (err) {
    console.error('Error fetching nodes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getNodeById(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('nodes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('Error fetching node:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateNode(req, res) {
  try {
    const { id } = req.params;
    const { label, config, position_x, position_y } = req.body;

    const updates = {};
    if (label !== undefined) updates.label = label;
    if (config !== undefined) updates.config = config;
    if (position_x !== undefined) updates.position_x = position_x;
    if (position_y !== undefined) updates.position_y = position_y;
    updates.updated_at = new Date();

    if (Object.keys(updates).length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data, error } = await supabase
      .from('nodes')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json({
      message: 'Node updated successfully',
      node: data[0]
    });
  } catch (err) {
    console.error('Error updating node:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteNode(req, res) {
  try {
    const { id } = req.params;

    await supabase
      .from('edges')
      .delete()
      .or(`source_node_id.eq.${id},target_node_id.eq.${id}`);

    const { error } = await supabase
      .from('nodes')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Node deleted successfully' });
  } catch (err) {
    console.error('Error deleting node:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}