import { PluginStateObject } from 'Molstar/mol-plugin-state/objects';
import { PluginContext } from 'Molstar/mol-plugin/context';
import { ParamDefinition as PD } from 'Molstar/mol-util/param-definition';
import { StateTransformer } from 'Molstar/mol-state/transformer';
import { Task } from 'Molstar/mol-task';

import {
    SurfaceRepresentation,
    SurfaceParams
} from './representation';

const CreateTransformer = StateTransformer.builderFactory('surface-plugin');


export const CreateSurface = CreateTransformer({
    name: 'create-surface',
    display: 'Surface',
    from: PluginStateObject.Root,
    to: PluginStateObject.Shape.Representation3D,
    params: {
        index: PD.Numeric(0),
        triangles: PD.Value([] as Array<Array<Array<number>>>),
        size: PD.Numeric(1.6)
    }
})({
    canAutoUpdate({ oldParams, newParams }) {
        return true;
    },
    apply({ a, params }, plugin: PluginContext) {
        return Task.create('Surface', async ctx => {
            const repr = SurfaceRepresentation({ webgl: plugin.canvas3d?.webgl, ...plugin.representation.structure.themes }, () => SurfaceParams);
            await repr.createOrUpdate({}, params).runInContext(ctx);
            return new PluginStateObject.Shape.Representation3D({ repr, sourceData: a }, { label: `Surface ${params.index}` });
        });
    }
});